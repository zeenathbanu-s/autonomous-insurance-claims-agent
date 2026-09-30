# Insurance Claims Processing Agent

**Autonomous FNOL Analysis & Intelligent Routing**

A full-stack placement assessment submission that processes First Notice of Loss (FNOL) insurance claim documents, extracts structured fields, validates completeness, and routes each claim through a deterministic Python rules engine.

---

## Problem Statement

Insurance operations teams receive FNOL documents in unstructured PDF and TXT formats. Manually reading, extracting fields, and deciding the correct handling workflow is slow and error-prone. This system automates that pipeline — from raw document upload to a structured routing decision — without requiring a database, without hardcoding any claim data, and without allowing AI to make routing decisions.

---

## Solution Overview

1. A claims handler uploads an FNOL document (PDF or TXT) through the React dashboard.
2. FastAPI receives the file, extracts raw text (PyMuPDF for PDF, direct decode for TXT).
3. Structured fields are extracted — by regex rules (default) or OpenAI GPT (if configured).
4. A validator identifies which of the 16 mandatory fields are missing.
5. A deterministic Python routing engine applies four fixed business rules in priority order.
6. The result is returned as a JSON response and rendered in the visual dashboard.

The LLM, if used, only assists with field extraction. The routing decision is always made by the Python engine.

---

## Key Features

- 📄 **PDF and TXT support** — PyMuPDF extracts text from real PDF documents
- 🔢 **16 mandatory FNOL fields** — all extracted, validated, and status-tagged per field
- 🎯 **Deterministic routing** — four business rules applied in documented priority order
- 🤖 **Optional LLM extraction** — OpenAI GPT-3.5/4 used when `LLM_API_KEY` is set
- 🔄 **Rule-based fallback** — regex extractor works with no API key required
- 📊 **Professional dashboard** — tabbed field cards, decision path, completeness bar
- 🌙 **Dark / Light mode** — toggled from the sidebar, preference persisted
- 📋 **Copy JSON + Download JSON** — exact assessment response available in both formats
- 🚫 **No database** — fully stateless, no MySQL, no file storage
- 🧪 **65 tests** — unit, integration, and live API tests

---

## Assessment Routing Rules

These rules are implemented exactly as specified. They are not configurable at runtime.

| Priority | Rule | Condition | Route |
|----------|------|-----------|-------|
| 1 | Fraud Indicators | Description contains `fraud`, `inconsistent`, or `staged` (case-insensitive) | **Investigation Flag** |
| 2 | Incomplete Document | Any of the 16 mandatory fields is missing | **Manual review** |
| 3 | Injury Claim | `claimType` equals `injury` (case-insensitive) | **Specialist Queue** |
| 4 | Damage Threshold | `estimatedDamage` < 25,000 and all fields present | **Fast-track** |

**Priority behaviour:** when multiple rules match the same claim, the highest-priority rule wins. Example: a claim that is both an injury claim and contains the word "fraud" is routed to **Investigation Flag** (priority 1), not Specialist Queue (priority 3).

---

## Required JSON Response Format

The API always returns exactly these four top-level keys:

```json
{
  "extractedFields": {
    "policyNumber": "POL-2024-VH-00134",
    "policyholderName": "James Carter",
    "effectiveDates": "01/01/2024 - 12/31/2024",
    "incidentDate": "03/15/2024",
    "incidentTime": "09:30 AM",
    "location": "Intersection of Maple Avenue...",
    "description": "The insured vehicle was struck...",
    "claimant": "James Carter",
    "thirdParties": "Robert Hughes",
    "contactDetails": "james.carter@email.com | Phone: (555) 204-7891",
    "assetType": "Sedan",
    "assetId": "VIN-1HGCM82633A123456",
    "estimatedDamage": 18000.0,
    "claimType": "vehicle",
    "attachments": "Police report #SPD-2024-03890, Photos of damage (6 images)",
    "initialEstimate": 18000.0
  },
  "missingFields": [],
  "recommendedRoute": "Fast-track",
  "reasoning": "The estimated damage of $18,000.00 is below the $25,000 threshold and all mandatory fields are present, qualifying for fast-track processing."
}
```

No other keys are added to this response.

---

## 16 Mandatory FNOL Fields

| # | Field (camelCase) | Section |
|---|-------------------|---------|
| 1 | `policyNumber` | Policy |
| 2 | `policyholderName` | Policy |
| 3 | `effectiveDates` | Policy |
| 4 | `incidentDate` | Incident |
| 5 | `incidentTime` | Incident |
| 6 | `location` | Incident |
| 7 | `description` | Incident |
| 8 | `claimant` | Parties |
| 9 | `thirdParties` | Parties |
| 10 | `contactDetails` | Parties |
| 11 | `assetType` | Asset |
| 12 | `assetId` | Asset |
| 13 | `estimatedDamage` | Asset |
| 14 | `claimType` | Other |
| 15 | `attachments` | Other |
| 16 | `initialEstimate` | Other |

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 18 |
| Frontend build | Vite | 5 |
| HTTP client | Axios | 1.x |
| Backend | Python + FastAPI | 0.111.0 |
| Data validation | Pydantic | 2.7.1 |
| ASGI server | Uvicorn | 0.29.0 |
| PDF extraction | PyMuPDF | 1.24.3 |
| Environment config | python-dotenv | 1.0.1 |
| LLM (optional) | OpenAI API | gpt-3.5-turbo / gpt-4 |
| Testing | pytest | 9.x |

---

## Project Structure

```
autonomous-insurance-claims-agent/
│
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app, CORS, router registration
│   │   ├── config.py                # Settings loaded from .env
│   │   ├── routes/
│   │   │   ├── claims.py            # POST /api/claims/process
│   │   │   └── health.py            # GET /api/health
│   │   ├── schemas/
│   │   │   └── claim.py             # Pydantic request/response models
│   │   └── services/
│   │       ├── document_parser.py   # File validation + text extraction
│   │       ├── extractor.py         # Strategy selector (LLM or rules)
│   │       ├── llm_extractor.py     # OpenAI extraction (optional)
│   │       ├── rule_extractor.py    # Regex-based extraction (default)
│   │       ├── validator.py         # Missing field detection
│   │       └── routing_engine.py    # Deterministic routing rules
│   ├── tests/
│   │   ├── test_document_parser.py
│   │   ├── test_routing_engine.py
│   │   ├── test_rule_extractor.py
│   │   ├── test_validator.py
│   │   ├── test_sample_docs.py      # Integration: all 5 sample files
│   │   └── test_live_api.py         # Live HTTP tests (requires backend running)
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Page router + dark mode state
│   │   ├── components/
│   │   │   ├── Sidebar.jsx          # Navigation + dark mode toggle + API status
│   │   │   └── Topbar.jsx           # Breadcrumb + contextual action buttons
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx    # Overview, workflow, route cards
│   │   │   ├── ProcessPage.jsx      # File upload + processing animation
│   │   │   ├── ResultPage.jsx       # Full result dashboard + JSON panel
│   │   │   ├── RoutingRulesPage.jsx # Business rules reference
│   │   │   └── AboutPage.jsx        # Project info, tech stack, workflow
│   │   ├── services/
│   │   │   └── api.js               # Axios service layer
│   │   └── styles/
│   │       └── global.css           # Full CSS with dark/light mode tokens
│   ├── package.json
│   └── .env.example
│
├── sample_documents/
│   ├── claim_fast_track.txt
│   ├── claim_manual_review.txt
│   ├── claim_investigation.txt
│   ├── claim_injury.txt
│   └── claim_complex.txt
│
├── .gitignore
└── README.md
```

---

## Prerequisites

- **Python 3.10+** — [python.org](https://www.python.org/downloads/)
- **Node.js 18+** — [nodejs.org](https://nodejs.org/)
- **npm** — included with Node.js

No other services (database, message broker, etc.) are required.

---

## Setup and Running — Windows CMD

Open two separate Command Prompt windows.

### Terminal 1 — Backend

```cmd
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

copy .env.example .env

uvicorn app.main:app --reload --port 8000
```

The backend starts at **http://localhost:8000**

### Terminal 2 — Frontend

```cmd
cd frontend

copy .env.example .env

npm install

npm run dev
```

The frontend starts at **http://localhost:5173**

> Both terminals must remain open while using the application.

---

## URLs

| What | URL |
|------|-----|
| **Web application** | http://localhost:5173 |
| **Backend API** | http://localhost:8000 |
| **Health check** | http://localhost:8000/api/health |
| **Swagger UI** | http://localhost:8000/docs |

---

## API Endpoints

### `POST /api/claims/process`

Accepts a `multipart/form-data` upload with a `file` field (PDF or TXT).

**Response:**
```json
{
  "extractedFields": {},
  "missingFields": [],
  "recommendedRoute": "",
  "reasoning": ""
}
```

### `GET /api/health`

Returns application status and LLM configuration flag.

```json
{
  "status": "ok",
  "llm_configured": false
}
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `LLM_API_KEY` | No | OpenAI API key. Leave blank to use rule-based extraction. |
| `LLM_PROVIDER` | No | `openai` (default). |
| `APP_ENV` | No | `development` (default). |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS origins. Default: `http://localhost:5173,http://localhost:3000` |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | No | Backend URL. Default: `http://localhost:8000` |

**The application runs fully without any API key.** The LLM is an optional enhancement for field extraction only.

---

## LLM Integration

The LLM integration is deliberately isolated in `backend/app/services/llm_extractor.py`.

**With no API key (default):**
- `rule_extractor.py` extracts all 16 fields using regex patterns
- All routing, validation, and response logic is identical

**With `LLM_API_KEY` set:**
- `llm_extractor.py` calls OpenAI GPT-3.5-turbo with a structured extraction prompt
- If the LLM call fails for any reason, the system automatically falls back to the rule extractor
- **The LLM never makes routing decisions** — it only returns a JSON field map
- The routing engine (`routing_engine.py`) always applies the deterministic business rules

---

## Sample Documents

Five sample FNOL documents are included in `sample_documents/`. Each tests a specific routing outcome.

| File | Expected Route | Key Condition |
|------|---------------|---------------|
| `claim_fast_track.txt` | **Fast-track** | Damage $18,000 < $25,000 threshold; all 16 fields present |
| `claim_manual_review.txt` | **Manual review** | Policy Number is intentionally absent |
| `claim_investigation.txt` | **Investigation Flag** | Description contains `staged` and `inconsistent` |
| `claim_injury.txt` | **Specialist Queue** | `claimType` = `injury`; no fraud keywords |
| `claim_complex.txt` | **Investigation Flag** | Description contains `fraud` (priority 1 wins over injury at priority 3) |

---

## Testing

### Run all offline tests

```cmd
cd autonomous-insurance-claims-agent

set PYTHONPATH=backend

backend\venv\Scripts\pytest backend\tests\ -v --ignore=backend\tests\test_live_api.py
```

**Result: 58 passed**

### Run live API tests (requires backend running)

```cmd
set PYTHONPATH=backend

backend\venv\Scripts\pytest backend\tests\test_live_api.py -v
```

**Result: 7 passed** (includes health check, JSON structure check, all 5 sample document routes)

### Test coverage breakdown

| Test file | What it tests |
|-----------|--------------|
| `test_document_parser.py` | File validation, TXT extraction, edge cases |
| `test_routing_engine.py` | All 4 rules, priority order, edge cases, threshold boundary |
| `test_rule_extractor.py` | Field extraction accuracy from realistic FNOL text |
| `test_validator.py` | Missing field detection, empty string handling |
| `test_sample_docs.py` | End-to-end pipeline for all 5 sample documents |
| `test_live_api.py` | HTTP requests to running API; JSON structure verification |

---

## How to Use the Application

1. Open **http://localhost:5173** in a browser.
2. The sidebar shows **API Connected** when the backend is reachable.
3. Navigate to **Process Claim** using the sidebar.
4. Drag and drop a file from `sample_documents/` onto the upload zone, or click to browse.
5. Click **▶ Analyze Claim**.
6. The result dashboard shows:
   - ✅ **Routing Decision** — the recommended route and reasoning
   - 📊 **Processing Decision Path** — visual five-step pipeline
   - 📋 **Extracted Fields** — tabbed cards for Policy, Incident, Parties, Asset, Other
   - 🔢 **Field Validation** — completeness bar and missing field tags
   - 💬 **Business Rule Decision** — the exact reasoning from the routing engine
   - `{}` **Structured JSON** — the exact API response with **Copy JSON** and **Download JSON** buttons
7. Use **↻ Process Another Claim** to test further documents.
8. The **Routing Rules** page documents all four rules and the priority chain.

---

## Processing Pipeline

```
FNOL PDF / TXT
     ↓
File validation (type + empty check)
     ↓
Text extraction (PyMuPDF for PDF, UTF-8 decode for TXT)
     ↓
Field extraction (LLM if configured → regex fallback)
     ↓
Missing field validation (16 mandatory fields checked)
     ↓
Deterministic routing engine (4 rules, priority order)
     ↓
JSON response: { extractedFields, missingFields, recommendedRoute, reasoning }
     ↓
React dashboard (route card, field tabs, JSON panel)
```

---

## Assessment Requirements Coverage

| Requirement | Status |
|-------------|--------|
| Extract key fields from FNOL PDF/TXT | ✅ 16 fields via regex or LLM |
| Identify missing or inconsistent fields | ✅ `validator.py` returns list of missing fields |
| Classify the insurance claim | ✅ `claimType` field extracted |
| Route the claim to the correct workflow | ✅ `routing_engine.py` with 4 deterministic rules |
| Routing explanation / reasoning | ✅ Returned in `reasoning` field |
| Required JSON response format | ✅ Exactly `{ extractedFields, missingFields, recommendedRoute, reasoning }` |
| Python FastAPI backend | ✅ |
| Pydantic request/response validation | ✅ |
| React.js frontend | ✅ |
| Frontend ↔ backend via REST API | ✅ Axios service layer |
| PDF extraction library | ✅ PyMuPDF |
| LLM optional / modular | ✅ Falls back to rule extractor automatically |
| No LLM routing decisions | ✅ `routing_engine.py` is never called by LLM |
| Stateless (no database) | ✅ |

---

## Project Status

- ✅ Backend: fully functional, stateless
- ✅ Frontend: professional dashboard with dark/light mode
- ✅ Integration: frontend ↔ backend verified end-to-end
- ✅ All 5 sample documents produce correct routes
- ✅ 58 offline tests + 7 live API tests passing
- ✅ JSON structure matches assessment specification exactly
- ✅ LLM integration modular and optional
