# APK Sentinel

APK Sentinel is an AI-powered Android APK security analysis platform that performs static analysis on APK files to identify potential security risks before installation.

The project analyzes Android applications for dangerous permissions, suspicious APIs, embedded URLs, network capabilities, and other indicators of malicious behavior. It also uses AI to generate simple, human-readable security explanations for non-technical users.

---

## Features

- Static APK Analysis
- Dangerous Permission Detection
- Risk Scoring Engine
- Suspicious API Detection
- Hardcoded URL Detection
- Ad SDK Detection
- AI-powered Risk Explanation
- Interactive Dashboard
- Secure File Upload
- Zip Bomb Protection

---

## Project Structure

```
apk_sentinel/
│
├── backend/
│   ├── modules/
│   ├── routes/
│   ├── uploads/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Tech Stack

### Backend

- FastAPI
- Python
- Androguard
- Groq API
- Uvicorn

### Frontend

- React
- Vite
- CSS
- JavaScript

---

## Installation

### Clone Repository

```bash
git clone https://github.com/<your-username>/apk_sentinel.git
cd apk_sentinel
```

---

### Backend Setup

```bash
cd backend

python -m venv myenv

source myenv/bin/activate
# Windows
# myenv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file inside the backend directory:

```env
GROQ_API_KEY=your_groq_api_key
```

Start the backend server:

```bash
uvicorn main:app --reload
```

Backend API:

```
http://127.0.0.1:8000
```

Swagger Documentation:

```
http://127.0.0.1:8000/docs
```

---

## Frontend Setup

> **Note:** This project requires **Node.js 20.19+** (Node.js **22.x** recommended).

```bash
cd frontend

npm install

npm run dev
```

Frontend:

```
http://localhost:5173
```

---

## Workflow

```
Upload APK
      │
      ▼
FastAPI Backend
      │
      ▼
Static Analysis
      │
      ▼
Risk Scoring
      │
      ▼
AI Risk Explanation
      │
      ▼
React Dashboard
```

---

## Security Features

- Secure File Upload Validation
- UUID-based File Storage
- Path Traversal Protection
- Zip Bomb Detection
- APK Size Validation
- DEX Bytecode Analysis
- AI-assisted Risk Assessment

---

## Future Enhancements

- Dynamic APK Analysis
- VirusTotal Integration
- PDF Report Generation
- Docker Deployment
- CI/CD Pipeline
- Malware Signature Database

---

## License

This project is intended for educational and cybersecurity research purposes only.
