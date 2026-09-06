from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from core.database import get_db
from core.security import get_current_user, hash_password, verify_password
from models.user import User, TriageQuery, PrescriptionQuery
from schemas.schemas import UpdateProfileRequest, ChangePasswordRequest, UserOut, DashboardResponse, DashboardItem

router = APIRouter(prefix="/users", tags=["users"])


# ── Schema for combined history ───────────────────────────────────────────────
class HistoryItem(BaseModel):
    id: int
    type: str
    summary: Optional[str] = None
    symptoms: Optional[str] = None
    risk_level: Optional[str] = None
    prescription_text: Optional[str] = None
    medication_count: Optional[int] = None
    is_voice_entry: Optional[bool] = False
    created_at: datetime

    class Config:
        from_attributes = True


# ── Dashboard ─────────────────────────────────────────────────────────────────
@router.get("/me/dashboard", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    triage_count = db.query(TriageQuery).filter(TriageQuery.user_id == current_user.id).count()
    prescription_count = db.query(PrescriptionQuery).filter(PrescriptionQuery.user_id == current_user.id).count()

    recent_triage = (
        db.query(TriageQuery)
        .filter(TriageQuery.user_id == current_user.id)
        .order_by(TriageQuery.created_at.desc())
        .limit(5).all()
    )
    recent_prescriptions = (
        db.query(PrescriptionQuery)
        .filter(PrescriptionQuery.user_id == current_user.id)
        .order_by(PrescriptionQuery.created_at.desc())
        .limit(5).all()
    )

    recent = []
    for t in recent_triage:
        recent.append(DashboardItem(id=t.id, type="triage", summary=t.summary, risk_level=t.risk_level, created_at=t.created_at))
    for p in recent_prescriptions:
        recent.append(DashboardItem(id=p.id, type="prescription", summary=p.summary, created_at=p.created_at))

    recent.sort(key=lambda x: x.created_at, reverse=True)

    return DashboardResponse(
        triage_count=triage_count,
        prescription_count=prescription_count,
        recent=recent[:5]
    )


# ── Combined history ──────────────────────────────────────────────────────────
@router.get("/me/history", response_model=List[HistoryItem])
def get_full_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    triage_rows = (
        db.query(TriageQuery)
        .filter(TriageQuery.user_id == current_user.id)
        .order_by(TriageQuery.created_at.desc())
        .limit(100).all()
    )
    prescription_rows = (
        db.query(PrescriptionQuery)
        .filter(PrescriptionQuery.user_id == current_user.id)
        .order_by(PrescriptionQuery.created_at.desc())
        .limit(100).all()
    )

    items = []
    for t in triage_rows:
        items.append(HistoryItem(
            id=t.id, type="triage",
            summary=t.summary, symptoms=t.symptoms,
            risk_level=t.risk_level, created_at=t.created_at
        ))
    for p in prescription_rows:
        items.append(HistoryItem(
            id=p.id, type="prescription",
            summary=p.summary, prescription_text=p.prescription_text,
            medication_count=p.medication_count,
            is_voice_entry=getattr(p, 'is_voice_entry', False),
            created_at=p.created_at
        ))

    items.sort(key=lambda x: x.created_at, reverse=True)
    return items


# ── Profile update ────────────────────────────────────────────────────────────
@router.put("/me", response_model=UserOut)
def update_profile(
    payload: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(User).filter(User.email == payload.email, User.id != current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")
    current_user.name = payload.name
    current_user.email = payload.email
    db.commit()
    db.refresh(current_user)
    return current_user


# ── Password change ───────────────────────────────────────────────────────────
@router.put("/me/password")
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated successfully"}
