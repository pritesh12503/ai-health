"""
ML Service Client
Calls your friend's ML service endpoints.
Expected ML service endpoints:
  POST /ml/triage       { symptoms: str } → { risk_level, conditions, home_care, doctor_recommendation }
  POST /ml/prescription  { prescription_text: str } → { medications: [...] }
"""


import httpx
from core.config import settings

async def call_triage_ml(symptoms: str) -> dict:
    transport = httpx.AsyncHTTPTransport(proxy=None)
    async with httpx.AsyncClient(
        timeout=60.0,
        transport=transport
    ) as client:
        response = await client.post(
            f"{settings.ML_SERVICE_URL}/ml/triage",
            json={"symptoms": symptoms}
        )
        response.raise_for_status()
        return response.json()

async def call_prescription_ml(prescription_text: str) -> dict:
    transport = httpx.AsyncHTTPTransport(proxy=None)
    async with httpx.AsyncClient(
        timeout=60.0,
        transport=transport
    ) as client:
        response = await client.post(
            f"{settings.ML_SERVICE_URL}/ml/prescription",
            json={"prescription_text": prescription_text}
        )
        response.raise_for_status()
        return response.json()


# ── MOCK responses (use while ML service is being built) ──────────────────────

def mock_triage_response(symptoms: str) -> dict:
    """
    Remove this once your friend's ML service is ready.
    Returns a realistic mock response for development.
    """
    symptoms_lower = symptoms.lower()
    risk_level = "LOW"
    if any(w in symptoms_lower for w in ["chest pain", "can't breathe", "difficulty breathing"]):
        risk_level = "URGENT"
    elif any(w in symptoms_lower for w in ["high fever", "102", "103", "vomiting blood"]):
        risk_level = "HIGH"
    elif any(w in symptoms_lower for w in ["fever", "cough", "headache"]):
        risk_level = "MEDIUM"

    return {
        "risk_level": risk_level,
        "conditions": [
            {
                "name": "Upper Respiratory Infection",
                "confidence": 0.72,
                "explanation": "Your symptoms are consistent with a viral upper respiratory infection.",
                "contributing_symptoms": ["fever", "cough", "headache"]
            },
            {
                "name": "Influenza (Flu)",
                "confidence": 0.54,
                "explanation": "The combination of fever and body symptoms may indicate flu.",
                "contributing_symptoms": ["fever", "fatigue"]
            }
        ],
        "home_care": "Rest well, stay hydrated with water and clear fluids, and monitor your temperature. Over-the-counter fever reducers like acetaminophen can help manage symptoms.",
        "doctor_recommendation": "If symptoms persist beyond 5 days or worsen significantly, consult a doctor."
    }


def mock_prescription_response(prescription_text: str) -> dict:
    """
    Remove this once your friend's ML service is ready.
    """
    return {
        "medications": [
            {
                "name": "Amoxicillin",
                "generic_name": "Amoxicillin",
                "dosage": "500mg",
                "frequency": "3 times daily",
                "duration": "7 days",
                "purpose": "An antibiotic used to treat bacterial infections such as throat, ear, and chest infections.",
                "instructions": "Take with or without food. Complete the full course even if you feel better.",
                "side_effects": ["Nausea", "Diarrhea", "Stomach upset", "Rash"],
                "warnings": [
                    "Tell your doctor if you are allergic to penicillin",
                    "May reduce effectiveness of oral contraceptives",
                    "Stop and seek help if you develop a rash or difficulty breathing"
                ]
            }
        ]
    }
