# APK Sentinel — Frontend

React (Vite) UI for the APK Sentinel backend.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Opens at http://localhost:5173. API calls to `/api/*` are proxied to
`http://127.0.0.1:8000` (see `vite.config.js`), so make sure the FastAPI
backend is running first:

```bash
cd ../backend
uvicorn main:app --reload
```

## Production build

```bash
npm run build
```

Outputs static files to `dist/`. If you deploy the frontend separately
from the backend (different origin), set `VITE_API_BASE` in a `.env` file
to the backend's full URL, and make sure CORS is enabled on the backend
for that origin.
