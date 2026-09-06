from sqlalchemy import Column, Integer, String, DateTime, Text, Float, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base


class MedicationReminder(Base):
    __tablename__ = "medication_reminders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    prescription_id = Column(Integer, ForeignKey("prescription_queries.id"))
    medication_name = Column(String(200), nullable=False)
    dose_times = Column(JSON)   # e.g. ["08:00", "14:00", "20:00"]
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User")


# ── NEW: Patient profile — created by a doctor for their patient ──────────────
class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # logged-in doctor
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)       # Male / Female / Other
    phone = Column(String(20), nullable=True)
    blood_group = Column(String(10), nullable=True)  # A+, B-, O+, etc.
    allergies = Column(Text, nullable=True)          # free text
    notes = Column(Text, nullable=True)              # extra doctor notes
    created_at = Column(DateTime, default=datetime.utcnow)

    doctor = relationship("User", back_populates="patients")
    prescriptions = relationship("PrescriptionQuery", back_populates="patient")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    triage_queries = relationship("TriageQuery", back_populates="user", cascade="all, delete")
    prescription_queries = relationship("PrescriptionQuery", back_populates="user", cascade="all, delete")
    patients = relationship("PatientProfile", back_populates="doctor", cascade="all, delete")  # NEW


class TriageQuery(Base):
    __tablename__ = "triage_queries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    symptoms = Column(Text, nullable=False)
    risk_level = Column(String(20))
    conditions = Column(JSON)
    home_care = Column(Text)
    doctor_recommendation = Column(Text)
    summary = Column(String(300))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="triage_queries")


class PrescriptionQuery(Base):
    __tablename__ = "prescription_queries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"), nullable=True)  # NEW — links to patient
    prescription_text = Column(Text, nullable=False)
    medications = Column(JSON)
    medication_count = Column(Integer, default=0)
    summary = Column(String(300))
    is_voice_entry = Column(Boolean, default=False)   # NEW — True when dictated by voice
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="prescription_queries")
    patient = relationship("PatientProfile", back_populates="prescriptions")  # NEW
