# MediAI — Health Triage & Prescription Explainer

AI-powered web app for symptom triage and prescription explanation.

## Project Structure

```
healthcare-app/
├── frontend/          # React + Vite + Tailwind + Shadcn
├── backend/           # FastAPI + PostgreSQL
└── docker-compose.yml
```

---

## Quick Start

### Option A — Docker (easiest)
```bash
docker-compose up --build
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

### Option B — Manual

**Backend:**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env         # Edit .env with your DB credentials
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Connecting Your Friend's ML Service

1. Your friend runs their ML service at `http://localhost:8001`
2. It needs two endpoints:
   - `POST /ml/triage` — input: `{ symptoms: str }` → output: `{ risk_level, conditions, home_care, doctor_recommendation }`
   - `POST /ml/prescription` — input: `{ prescription_text: str }` → output: `{ medications: [...] }`
3. In `backend/routes/triage.py` and `backend/routes/prescriptions.py`, set `USE_MOCK = False`
4. Update `ML_SERVICE_URL` in your `.env`

---

## Pages

| Route | Page |
|-------|------|
| `/` | Landing |
| `/login` | Login |
| `/signup` | Sign Up |
| `/dashboard` | Dashboard |
| `/triage` | Symptom Input |
| `/triage/result/:id` | Triage Results |
| `/prescription` | Prescription Input |
| `/prescription/result/:id` | Prescription Results |
| `/history` | Query History |
| `/profile` | Profile Settings |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| POST | `/api/triage` | Analyze symptoms |
| GET | `/api/triage/history` | Triage history |
| GET | `/api/triage/:id` | Single triage result |
| POST | `/api/prescriptions/explain` | Explain prescription |
| GET | `/api/prescriptions/history` | Prescription history |
| GET | `/api/users/me/dashboard` | Dashboard stats |
| PUT | `/api/users/me` | Update profile |
| PUT | `/api/users/me/password` | Change password |

---

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Axios
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, JWT Auth, Passlib/Bcrypt
- **ML Integration:** HTTP client (httpx) calling your friend's Python ML service
