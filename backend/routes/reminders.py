from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from apscheduler.schedulers.background import BackgroundScheduler
from core.database import get_db
from core.security import get_current_user
from models.user import MedicationReminder, User
from schemas.schemas import ReminderRequest, ReminderResponse
from typing import List

router = APIRouter(prefix="/reminders", tags=["reminders"])
scheduler = BackgroundScheduler()
scheduler.start()


def send_notification(email: str, medication: str):
    # Currently prints to terminal — replace with email/push in production
    print(f"💊 REMINDER: Time to take {medication} — sent to {email}")


@router.post("", response_model=ReminderResponse, status_code=201)
def create_reminder(
    payload: ReminderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate dose times format
    for t in payload.dose_times:
        try:
            hour, minute = map(int, t.split(":"))
            if not (0 <= hour <= 23 and 0 <= minute <= 59):
                raise ValueError
        except Exception:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid time format '{t}'. Use HH:MM format like 08:00"
            )

    reminder = MedicationReminder(
        user_id=current_user.id,
        medication_name=payload.medication_name,
        dose_times=payload.dose_times,
        is_active=True
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)

    # Schedule a daily cron job for each dose time
    for time_str in payload.dose_times:
        hour, minute = map(int, time_str.split(":"))
        scheduler.add_job(
            send_notification,
            'cron',
            hour=hour,
            minute=minute,
            args=[current_user.email, payload.medication_name],
            id=f"reminder_{reminder.id}_{time_str}",
            replace_existing=True
        )

    return reminder


@router.get("", response_model=List[ReminderResponse])
def get_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(MedicationReminder).filter(
        MedicationReminder.user_id == current_user.id,
        MedicationReminder.is_active == True
    ).order_by(MedicationReminder.created_at.desc()).all()


@router.delete("/{reminder_id}", status_code=204)
def delete_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reminder = db.query(MedicationReminder).filter(
        MedicationReminder.id == reminder_id,
        MedicationReminder.user_id == current_user.id
    ).first()

    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    # Remove scheduled jobs for this reminder
    for time_str in (reminder.dose_times or []):
        job_id = f"reminder_{reminder_id}_{time_str}"
        if scheduler.get_job(job_id):
            scheduler.remove_job(job_id)

    # Mark as inactive instead of deleting (keeps history)
    reminder.is_active = False
    db.commit()