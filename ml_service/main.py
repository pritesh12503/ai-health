from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os, json
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

class TriageRequest(BaseModel):
    symptoms: str

class PrescriptionRequest(BaseModel):
    prescription_text: str

class AdvisoryRequest(BaseModel):
    query: str

def call_llm(prompt: str):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    text = response.choices[0].message.content.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1]
    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]
    return json.loads(text.strip())

BLOCKED = ["suicide", "kill myself", "overdose on purpose"]

def safety_check(text: str):
    for word in BLOCKED:
        if word in text.lower():
            raise HTTPException(status_code=400, detail="Query blocked. Call iCall: 9152987821")

@app.post("/ml/triage")
async def triage(req: TriageRequest):
    safety_check(req.symptoms)
    prompt = f"""
You are a medical triage AI. A patient reports: "{req.symptoms}"

Risk levels:
- URGENT: Go to ER immediately
- HIGH: See a doctor today
- MEDIUM: See a doctor within 2-3 days
- LOW: Manageable at home

Reply ONLY with this exact JSON, no extra text, no markdown:
{{
  "risk_level": "URGENT|HIGH|MEDIUM|LOW",
  "conditions": [
    {{
      "name": "condition name",
      "confidence": 0.85,
      "explanation": "why this condition matches",
      "contributing_symptoms": ["symptom1", "symptom2"]
    }}
  ],
  "home_care": "what the patient can do at home",
  "doctor_recommendation": "when and why to see a doctor"
}}
"""
    return call_llm(prompt)

@app.post("/ml/prescription")
async def prescription(req: PrescriptionRequest):
    safety_check(req.prescription_text)
    prompt = f"""
You are a pharmacist AI. Explain this prescription: "{req.prescription_text}"

Reply ONLY with this exact JSON, no extra text, no markdown:
{{
  "medications": [
    {{
      "name": "drug name",
      "dosage": "500mg",
      "frequency": "3 times daily",
      "duration": "7 days",
      "purpose": "what this drug treats",
      "instructions": "how to take it correctly",
      "side_effects": ["nausea", "dizziness"],
      "warnings": ["avoid alcohol", "do not drive"]
    }}
  ]
}}
"""
    return call_llm(prompt)

@app.post("/ml/advisory")
async def advisory(req: AdvisoryRequest):
    safety_check(req.query)
    prompt = f"""
You are a general health advisor AI. Answer this health question: "{req.query}"

Reply ONLY with this exact JSON, no extra text, no markdown:
{{
  "advice": "clear helpful health guidance",
  "lifestyle_tips": ["tip 1", "tip 2", "tip 3"],
  "when_to_see_doctor": "specific signs that need professional help",
  "disclaimer": "This is general health information, not a substitute for professional medical advice."
}}
"""
    return call_llm(prompt)