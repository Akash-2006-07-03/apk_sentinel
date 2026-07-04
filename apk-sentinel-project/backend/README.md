# APK Sentinel Backend

The backend is built using FastAPI and performs APK static analysis, risk scoring, and AI-based security explanation generation.

---

## Features

- APK Upload API
- Static APK Analysis
- Permission Analysis
- URL Extraction
- Suspicious API Detection
- Risk Scoring Engine
- AI-generated Risk Explanation

---

## Project Structure

```
backend/
│
├── modules/
│   ├── ai_engine.py
│   ├── risk_scoring.py
│   └── static_analysis.py
│
├── routes/
│   └── upload.py
│
├── uploads/
├── main.py
├── requirements.txt
└── .env.example
```

---

## Installation

Create a virtual environment:

```bash
python -m venv myenv
```

Activate it:

Linux/macOS

```bash
source myenv/bin/activate
```

Windows

```bash
myenv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## Environment Variables

Create a `.env` file.

```env
GROQ_API_KEY=your_groq_api_key
```

---

## Run Server

```bash
uvicorn main:app --reload
```

---

## API Documentation

Swagger UI

```
http://127.0.0.1:8000/docs
```

---

## API Endpoint

### Upload APK

```
POST /api/upload
```

Accepts:

- APK file

Returns:

- APK metadata
- Dangerous permissions
- Risk score
- Risk level
- AI explanation
- Suspicious APIs
- URLs

---

## Technologies

- FastAPI
- Python
- Androguard
- Groq
- Uvicorn
- python-dotenv
