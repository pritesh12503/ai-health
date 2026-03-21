from sqlalchemy import Column, Integer, String, DateTime, Text, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    triage_queries = relationship("TriageQuery", back_populates="user", cascade="all, delete")
    prescription_queries = relationship("PrescriptionQuery", back_populates="user", cascade="all, delete")


class TriageQuery(Base):
    __tablename__ = "triage_queries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    symptoms = Column(Text, nullable=False)
    risk_level = Column(String(20))           # URGENT | HIGH | MEDIUM | LOW
    conditions = Column(JSON)                  # list of {name, confidence, explanation, contributing_symptoms}
    home_care = Column(Text)
    doctor_recommendation = Column(Text)
    summary = Column(String(300))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="triage_queries")


class PrescriptionQuery(Base):
    __tablename__ = "prescription_queries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    prescription_text = Column(Text, nullable=False)
    medications = Column(JSON)                  # list of medication explanations
    medication_count = Column(Integer, default=0)
    summary = Column(String(300))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="prescription_queries")
