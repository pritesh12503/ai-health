from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user, hash_password, verify_password
from models.user import User, TriageQuery, PrescriptionQuery
from schemas.schemas import UpdateProfileRequest, ChangePasswordRequest, UserOut, DashboardResponse, DashboardItem

router = APIRouter(prefix="/users", tags=["users"])


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
        .limit(5)
        .all()
    )
    recent_prescriptions = (
        db.query(PrescriptionQuery)
        .filter(PrescriptionQuery.user_id == current_user.id)
        .order_by(PrescriptionQuery.created_at.desc())
        .limit(5)
        .all()
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


@router.put("/me", response_model=UserOut)
def update_profile(
    payload: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check email not taken by another user
    existing = db.query(User).filter(User.email == payload.email, User.id != current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")

    current_user.name = payload.name
    current_user.email = payload.email
    db.commit()
    db.refresh(current_user)
    return current_user


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
