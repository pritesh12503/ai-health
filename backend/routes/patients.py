from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from core.database import get_db
from core.security import get_current_user
from models.user import User, PatientProfile, PrescriptionQuery

router = APIRouter(prefix="/patients", tags=["patients"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class PatientCreate(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    notes: Optional[str] = None

class PatientOut(BaseModel):
    id: int
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PatientPrescriptionItem(BaseModel):
    id: int
    prescription_text: str
    medications: Optional[list] = []
    medication_count: Optional[int] = 0
    summary: Optional[str] = None
    is_voice_entry: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


# ── Create patient ────────────────────────────────────────────────────────────

@router.post("", response_model=PatientOut, status_code=201)
def create_patient(
    payload: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = PatientProfile(
        doctor_id=current_user.id,
        **payload.dict()
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


# ── List all patients for this doctor ────────────────────────────────────────

@router.get("", response_model=List[PatientOut])
def list_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(PatientProfile)
        .filter(PatientProfile.doctor_id == current_user.id)
        .order_by(PatientProfile.name)
        .all()
    )


# ── Get single patient ────────────────────────────────────────────────────────

@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(PatientProfile).filter(
        PatientProfile.id == patient_id,
        PatientProfile.doctor_id == current_user.id
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


# ── Get patient's full prescription history ───────────────────────────────────

@router.get("/{patient_id}/history", response_model=List[PatientPrescriptionItem])
def get_patient_history(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(PatientProfile).filter(
        PatientProfile.id == patient_id,
        PatientProfile.doctor_id == current_user.id
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    return (
        db.query(PrescriptionQuery)
        .filter(PrescriptionQuery.patient_id == patient_id)
        .order_by(PrescriptionQuery.created_at.desc())
        .all()
    )


# ── Update patient ────────────────────────────────────────────────────────────

@router.put("/{patient_id}", response_model=PatientOut)
def update_patient(
    patient_id: int,
    payload: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(PatientProfile).filter(
        PatientProfile.id == patient_id,
        PatientProfile.doctor_id == current_user.id
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    for key, value in payload.dict().items():
        setattr(patient, key, value)
    db.commit()
    db.refresh(patient)
    return patient


# ── Delete patient ────────────────────────────────────────────────────────────

@router.delete("/{patient_id}", status_code=204)
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(PatientProfile).filter(
        PatientProfile.id == patient_id,
        PatientProfile.doctor_id == current_user.id
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    db.delete(patient)
    db.commit()
