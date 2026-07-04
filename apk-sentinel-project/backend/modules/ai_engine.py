import os
from groq import Groq
from dotenv import load_dotenv

# Load .env every time this module runs
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

DANGEROUS_PERMISSION_MEANINGS = {
    "READ_SMS": "read your SMS messages (possible OTP theft)",
    "SEND_SMS": "send SMS messages from your phone (possible fraud)",
    "RECORD_AUDIO": "access your microphone (possible spying)",
    "READ_CONTACTS": "read all your contacts",
    "ACCESS_FINE_LOCATION": "track your exact GPS location",
    "CAMERA": "access your camera silently",
    "READ_CALL_LOG": "read your call history",
    "WRITE_EXTERNAL_STORAGE": "write files to your storage",
    "READ_EXTERNAL_STORAGE": "read all files on your storage",
}

def explain_risk(analysis: dict, risk: dict) -> str:
    try:
        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            return "AI explanation unavailable: GROQ_API_KEY not found in .env file"

        client = Groq(api_key=api_key)

        # Build human readable permission list
        dangerous = analysis.get("dangerous_permissions", [])
        readable_perms = []
        for p in dangerous:
            for key, meaning in DANGEROUS_PERMISSION_MEANINGS.items():
                if key in p:
                    readable_perms.append(meaning)

        prompt = f"""
You are a mobile security expert explaining results to a normal user (not a technical person).

An Android app was scanned with these results:

- App Package: {analysis.get('package_name')}
- Risk Level: {risk.get('level')} (Score: {risk.get('score')}/100)
- Dangerous capabilities found: {readable_perms if readable_perms else 'None critical'}
- Number of hidden ad/tracking components: {len(analysis.get('activities', []))}
- Ad networks injected: {risk.get('reasons', [])}
- Suspicious URLs in code: {len(analysis.get('urls_found', []))}
- Suspicious code behaviors: {analysis.get('suspicious_apis', []) or 'None detected'}

Respond with 6 to 7 short bullet points, one per line, each starting with "• ".
Cover, in this order:
• What this app is doing in the background (be specific — name the actual permission or behavior)
• What data or information is at risk because of that
• Whether it is connecting to ads, trackers, or unknown servers, and what that means
• Any suspicious technical behavior (like hidden code loading or encryption), explained in plain terms
• Any other notable concern from the scan results not already covered above
• Whether it is safe to install
• What the user should do next

If a bullet would be redundant with the results given (e.g. no suspicious code behavior was found),
skip it and cover something else relevant instead — always give at least 6 bullets total.

Rules:
- Each bullet must be ONE short sentence (max ~20 words).
- Use simple, everyday words. No technical jargon.
- Be direct and specific — name the actual risk, not a vague warning.
- Output ONLY the bullet lines. No heading, no intro, no extra text, no numbering.
"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=400,
            temperature=0.3,
            timeout=15
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"AI explanation error: {str(e)}"
