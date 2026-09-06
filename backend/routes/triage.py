from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user
from models.user import User, TriageQuery
from schemas.schemas import TriageRequest, TriageResponse, TriageHistoryItem
from ml.ml_client import call_triage_ml, mock_triage_response
from typing import List

router = APIRouter(prefix="/triage", tags=["triage"])

USE_MOCK = False


@router.post("", response_model=TriageResponse, status_code=201)
async def analyze_symptoms(
    payload: TriageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if len(payload.symptoms.strip()) < 10:
        raise HTTPException(status_code=400, detail="Please provide more detail about your symptoms")

    # Fetch recent history to send as context to ML
    recent_history = (
        db.query(TriageQuery)
        .filter(TriageQuery.user_id == current_user.id)
        .order_by(TriageQuery.created_at.desc())
        .limit(5)
        .all()
    )
    history_text = "\n".join([
        f"- {q.created_at.strftime('%Y-%m-%d')}: {q.symptoms[:80]} → {q.risk_level}"
        for q in recent_history
    ]) or "No previous history."

    # Call ML (or mock) — only ONCE, inside try/except
    try:
        if USE_MOCK:
            ml_result = mock_triage_response(payload.symptoms)
        else:
            ml_result = await call_triage_ml(payload.symptoms, history_text)
            if ml_result is None:
                raise Exception("ML service returned no result")
        print("ML RESULT:", ml_result)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"ML service unavailable: {str(e)}")

    summary = f"{payload.symptoms[:100]}..." if len(payload.symptoms) > 100 else payload.symptoms

    query = TriageQuery(
        user_id=current_user.id,
        symptoms=payload.symptoms,
        risk_level=ml_result.get("risk_level", "LOW"),
        conditions=ml_result.get("conditions", []),
        home_care=ml_result.get("home_care"),
        doctor_recommendation=ml_result.get("doctor_recommendation"),
        summary=summary
    )
    db.add(query)
    db.commit()
    db.refresh(query)
    return query


@router.get("/history", response_model=List[TriageHistoryItem])
def get_triage_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    queries = (
        db.query(TriageQuery)
        .filter(TriageQuery.user_id == current_user.id)
        .order_by(TriageQuery.created_at.desc())
        .limit(50)
        .all()
    )
    return [TriageHistoryItem(
        id=q.id,
        symptoms=q.symptoms,
        risk_level=q.risk_level,
        summary=q.summary,
        created_at=q.created_at,
        type="triage"
    ) for q in queries]


@router.get("/{query_id}", response_model=TriageResponse)
def get_triage_result(
    query_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(TriageQuery).filter(
        TriageQuery.id == query_id,
        TriageQuery.user_id == current_user.id
    ).first()
    if not query:
        raise HTTPException(status_code=404, detail="Result not found")
    return query
