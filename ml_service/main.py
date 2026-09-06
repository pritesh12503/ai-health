from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os, json, re
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI(title="MediAI ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request Models ─────────────────────────────────────────────────────────────

class OCRRequest(BaseModel):
    image_base64: str

class TriageRequest(BaseModel):
    symptoms: str
    history: str = "No previous history."

class PrescriptionRequest(BaseModel):
    prescription_text: str

class AdvisoryRequest(BaseModel):
    query: str


# ── Helper: call text LLM ──────────────────────────────────────────────────────

def call_llm(prompt: str, max_tokens: int = 2000):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=max_tokens
    )
    text = response.choices[0].message.content.strip()

    # Strip markdown code fences if model wraps output in them
    if text.startswith("```"):
        text = text.split("\n", 1)[-1]
    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]

    text = text.strip()

    # Try direct JSON parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to extract the first complete { ... } block from the response
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except Exception:
                pass
        raise HTTPException(
            status_code=500,
            detail=f"ML service returned invalid response. Please try again. (Debug: {text[:200]})"
        )


# ── Safety filter ──────────────────────────────────────────────────────────────

BLOCKED = ["suicide", "kill myself", "overdose on purpose"]

def safety_check(text: str):
    for word in BLOCKED:
        if word in text.lower():
            raise HTTPException(
                status_code=400,
                detail="Query blocked for safety reasons. If you need help, call iCall: 9152987821"
            )


# ── OCR: Read prescription image ───────────────────────────────────────────────

@app.post("/ml/ocr")
async def ocr_prescription(req: OCRRequest):
    """
    Reads a prescription image.
    STRICT: Only extracts medicines actually visible — never invents or hallucinates.
    """
    try:
        response = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{req.image_base64}"
                        }
                    },
                    {
                        "type": "text",
                        "text": """You are reading a medical prescription image.

STRICT RULES — follow exactly:
1. ONLY extract medicine names that you can ACTUALLY SEE written in this image
2. DO NOT invent, guess, or add any medicine that is not clearly present in the image
3. DO NOT use your medical knowledge to suggest related drugs
4. DO NOT fill in missing medicines based on what "might" be prescribed together
5. If you see 3 medicines written, output exactly 3 lines — not more, not less
6. If you cannot read a specific word, write (unreadable) in that place
7. If this is not a prescription or no medicines are visible, output: NO_MEDICINES_FOUND

Common doctor shorthand to decode when you see it:
- OD or od = once daily
- BD or bd = twice daily
- TID or tid = 3 times daily
- QID or qid = 4 times daily
- SOS = as needed
- AC = before food, PC = after food, HS = at bedtime

Output format — one line per medicine:
MedicineName Dosage - Frequency - Duration - Special instructions (if written)

Example for a prescription showing exactly 2 medicines:
Amoxicillin 500mg - 3 times daily - 7 days - after food
Omeprazole 20mg - once daily - 5 days

Output ONLY the medicine lines. No introduction, no heading, no extra sentences."""
                    }
                ]
            }],
            temperature=0.0,
            max_tokens=400
        )

        transcribed = response.choices[0].message.content.strip()
        print("OCR RAW:", transcribed[:300])

        if not transcribed or transcribed.strip() == "NO_MEDICINES_FOUND":
            return {
                "transcribed_text": "",
                "warning": "No medicines found in image. Please type your prescription manually."
            }

        return {"transcribed_text": transcribed}

    except Exception as e:
        print("OCR ERROR:", str(e))
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")


# ── Triage: Analyze symptoms ───────────────────────────────────────────────────

@app.post("/ml/triage")
async def triage(req: TriageRequest):
    safety_check(req.symptoms)

    prompt = f"""You are a medical triage AI assistant helping a patient understand their symptoms.

PATIENT HISTORY (previous visits):
{req.history}

CURRENT SYMPTOMS DESCRIBED BY PATIENT:
"{req.symptoms}"

Consider history when assessing risk — look for patterns like recurring symptoms or chronic conditions.

Reply ONLY with this exact JSON, no markdown, no extra text:
{{
  "risk_level": "URGENT|HIGH|MEDIUM|LOW",
  "conditions": [
    {{
      "name": "condition name",
      "confidence": 0.85,
      "explanation": "why this condition matches the symptoms in simple English",
      "contributing_symptoms": ["symptom1", "symptom2"]
    }}
  ],
  "home_care": "practical steps the patient can take at home right now",
  "doctor_recommendation": "clear advice on when and why to see a doctor"
}}

Risk levels: URGENT = go to ER now, HIGH = see doctor today, MEDIUM = see doctor in 2-3 days, LOW = rest at home
"""
    return call_llm(prompt, max_tokens=1200)


# ── Prescription: Explain medicines in simple language ─────────────────────────

@app.post("/ml/prescription")
async def prescription(req: PrescriptionRequest):
    safety_check(req.prescription_text)

    # Count medicine lines to set the right token budget
    lines = [l.strip() for l in req.prescription_text.strip().split('\n') if l.strip()]
    num_medicines = len(lines)

    # Hard cap at 8 medicines to stay within LLM token limits
    # A real doctor prescription never has more than 5-7 medicines
    if num_medicines > 8:
        lines = lines[:8]
        trimmed_text = '\n'.join(lines)
        capped = True
    else:
        trimmed_text = req.prescription_text
        capped = False

    # 400 tokens per medicine gives thorough explanations without hitting limits
    token_budget = min(len(lines) * 400 + 300, 4000)

    prompt = f"""You are a friendly pharmacist explaining a prescription to a patient with no medical background.
Use simple plain English — no medical jargon.

PRESCRIPTION TO EXPLAIN:
{trimmed_text}

For each medicine, explain:
- What it does in simple words
- WHY the doctor most likely prescribed it (what condition it treats)
- How and when to take it correctly
- Common side effects in plain language
- Important warnings

Reply ONLY with this exact JSON, no markdown, no extra text:
{{
  "medications": [
    {{
      "name": "medicine name",
      "dosage": "e.g. 500mg",
      "frequency": "e.g. 3 times daily",
      "duration": "e.g. 7 days",
      "purpose": "Simple explanation: what this medicine does and why the doctor likely prescribed it.",
      "instructions": "Exactly how to take it. When, with or without food, how many hours apart.",
      "side_effects": ["side effect 1 in simple words", "side effect 2"],
      "warnings": ["warning 1", "warning 2"]
    }}
  ]
}}
"""
    result = call_llm(prompt, max_tokens=token_budget)

    if capped:
        result["note"] = f"Showing explanation for first 8 of {num_medicines} detected medicines. Edit the text above to explain specific ones."

    return result


# ── Advisory: General health questions ────────────────────────────────────────

@app.post("/ml/advisory")
async def advisory(req: AdvisoryRequest):
    safety_check(req.query)

    prompt = f"""You are a friendly general health advisor answering a patient's health question in simple language.

QUESTION: "{req.query}"

Reply ONLY with this exact JSON, no markdown, no extra text:
{{
  "advice": "Clear, helpful, practical guidance in plain English",
  "lifestyle_tips": ["tip 1", "tip 2", "tip 3"],
  "when_to_see_doctor": "Specific signs that mean the patient must see a doctor",
  "disclaimer": "This is general health information only, not a substitute for professional medical advice."
}}
"""
    return call_llm(prompt, max_tokens=800)