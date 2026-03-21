from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user
from models.user import User, PrescriptionQuery
from schemas.schemas import PrescriptionRequest, PrescriptionResponse
from ml.ml_client import call_prescription_ml, mock_prescription_response
from typing import List

router = APIRouter(prefix="/prescriptions", tags=["prescriptions"])

USE_MOCK = True  # Set to False once ML service is ready


@router.post("/explain", response_model=PrescriptionResponse, status_code=201)
async def explain_prescription(
    payload: PrescriptionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if len(payload.prescription_text.strip()) < 5:
        raise HTTPException(status_code=400, detail="Please enter prescription details")

    try:
        if USE_MOCK:
            ml_result = mock_prescription_response(payload.prescription_text)
        else:
            ml_result = await call_prescription_ml(payload.prescription_text)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"ML service unavailable: {str(e)}")

    medications = ml_result.get("medications", [])
    med_names = [m.get("name", "") for m in medications]
    summary = "Medications: " + ", ".join(med_names[:3])
    if len(med_names) > 3:
        summary += f" +{len(med_names) - 3} more"

    query = PrescriptionQuery(
        user_id=current_user.id,
        prescription_text=payload.prescription_text,
        medications=medications,
        medication_count=len(medications),
        summary=summary
    )
    db.add(query)
    db.commit()
    db.refresh(query)
    return query


@router.get("/history")
def get_prescription_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    queries = (
        db.query(PrescriptionQuery)
        .filter(PrescriptionQuery.user_id == current_user.id)
        .order_by(PrescriptionQuery.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": q.id,
            "prescription_text": q.prescription_text,
            "medication_count": q.medication_count,
            "summary": q.summary,
            "created_at": q.created_at,
            "type": "prescription"
        }
        for q in queries
    ]


@router.get("/{query_id}", response_model=PrescriptionResponse)
def get_prescription_result(
    query_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(PrescriptionQuery).filter(
        PrescriptionQuery.id == query_id,
        PrescriptionQuery.user_id == current_user.id
    ).first()
    if not query:
        raise HTTPException(status_code=404, detail="Result not found")
    return query
