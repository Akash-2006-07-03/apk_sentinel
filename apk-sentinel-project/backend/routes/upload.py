from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil, os, uuid
from modules.static_analysis import analyze_apk
from modules.risk_scoring import calculate_risk
from modules.ai_engine import explain_risk

router = APIRouter()

UPLOAD_DIR = "uploads/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_UPLOAD_SIZE = 300 * 1024 * 1024  # 300 MB, matches static_analysis's cap
CHUNK_SIZE = 1024 * 1024


@router.post("/upload")
async def upload_apk(file: UploadFile = File(...)):

    if not file.filename or not file.filename.lower().endswith(".apk"):
        raise HTTPException(status_code=400, detail="Only .apk files are allowed")

    # Sanitize filename: strip any directory components and generate a
    # unique on-disk name so a crafted filename can't write outside uploads/
    # or overwrite an existing file.
    original_name = os.path.basename(file.filename)
    safe_name = f"{uuid.uuid4().hex}_{original_name}"
    save_path = os.path.join(UPLOAD_DIR, safe_name)

    # Stream to disk with a hard size cap instead of trusting Content-Length
    total_written = 0
    try:
        with open(save_path, "wb") as f:
            while chunk := await file.read(CHUNK_SIZE):
                total_written += len(chunk)
                if total_written > MAX_UPLOAD_SIZE:
                    f.close()
                    os.remove(save_path)
                    raise HTTPException(
                        status_code=413,
                        detail=f"File exceeds max allowed size of {MAX_UPLOAD_SIZE // (1024*1024)}MB"
                    )
                f.write(chunk)
    except HTTPException:
        raise
    except Exception as e:
        if os.path.exists(save_path):
            os.remove(save_path)
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Run analysis — isolate so one bad/corrupt APK returns a clean error
    # instead of a raw 500 with no context.
    try:
        analysis = analyze_apk(save_path)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"APK analysis failed: {str(e)}")

    if "error" in analysis:
        raise HTTPException(status_code=422, detail=analysis["error"])

    risk = calculate_risk(analysis)
    explanation = explain_risk(analysis, risk)

    return {
        "message": "APK uploaded and analyzed successfully",
        "filename": original_name,
        "stored_as": safe_name,
        "analysis": analysis,
        "risk": risk,
        "ai_explanation": explanation
    }