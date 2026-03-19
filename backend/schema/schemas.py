from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── Triage ────────────────────────────────────────────────────────────────────

class TriageRequest(BaseModel):
    symptoms: str

class ConditionResult(BaseModel):
    name: str
    confidence: Optional[float] = None
    explanation: Optional[str] = None
    contributing_symptoms: Optional[List[str]] = []

class TriageResponse(BaseModel):
    id: int
    symptoms: str
    risk_level: str
    conditions: Optional[List[ConditionResult]] = []
    home_care: Optional[str] = None
    doctor_recommendation: Optional[str] = None
    summary: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TriageHistoryItem(BaseModel):
    id: int
    symptoms: str
    risk_level: Optional[str]
    summary: Optional[str]
    created_at: datetime
    type: str = "triage"

    class Config:
        from_attributes = True


# ── Prescription ──────────────────────────────────────────────────────────────

class PrescriptionRequest(BaseModel):
    prescription_text: str

class MedicationExplanation(BaseModel):
    name: str
    generic_name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    purpose: Optional[str] = None
    instructions: Optional[str] = None
    side_effects: Optional[List[str]] = []
    warnings: Optional[List[str]] = []

class PrescriptionResponse(BaseModel):
    id: int
    prescription_text: str
    medications: Optional[List[MedicationExplanation]] = []
    medication_count: int
    summary: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── User / Dashboard ──────────────────────────────────────────────────────────

class UpdateProfileRequest(BaseModel):
    name: str
    email: EmailStr

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class DashboardItem(BaseModel):
    id: int
    type: str
    summary: Optional[str]
    risk_level: Optional[str] = None
    created_at: datetime

class DashboardResponse(BaseModel):
    triage_count: int
    prescription_count: int
    recent: List[DashboardItem]
