from androguard.core.apk import APK
import re
import zipfile
import os

DANGEROUS_PERMISSIONS = [
    "READ_SMS", "SEND_SMS", "RECEIVE_SMS",
    "RECORD_AUDIO", "READ_CONTACTS",
    "ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION",
    "CAMERA", "READ_CALL_LOG", "PROCESS_OUTGOING_CALLS",
    "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE",
    "GET_ACCOUNTS", "USE_BIOMETRIC", "USE_FINGERPRINT",
    "BODY_SENSORS", "READ_PHONE_STATE"
]

NETWORK_PERMISSIONS = [
    "INTERNET", "ACCESS_NETWORK_STATE", "ACCESS_WIFI_STATE"
]

# Real smali/bytecode-level signatures — these actually appear in .dex files
# when the corresponding Java API is used, unlike plain English names.
SUSPICIOUS_API_PATTERNS = {
    "Ljava/lang/Runtime;->exec": "Runtime.exec (shell command execution)",
    "Ljava/lang/ProcessBuilder;": "ProcessBuilder (process spawning)",
    "Ldalvik/system/DexClassLoader;": "DexClassLoader (dynamic code loading)",
    "Ldalvik/system/PathClassLoader;": "PathClassLoader (dynamic code loading)",
    "Ljava/lang/reflect/Method;->invoke": "Reflection invoke (obfuscation/bypass)",
    "Ljava/lang/Class;->forName": "Class.forName (reflection)",
    "Landroid/webkit/WebView;->loadUrl": "WebView.loadUrl (embedded browser)",
    "Landroid/webkit/WebView;->addJavascriptInterface": "WebView JS bridge (RCE risk)",
    "Landroid/database/sqlite/SQLiteDatabase;->execSQL": "Raw SQL execution",
    "Ljavax/crypto/Cipher;": "Cipher usage (encryption/decryption)",
    "Ljavax/crypto/spec/SecretKeySpec;": "Hardcoded-key-capable crypto (SecretKeySpec)",
    "Ljavax/crypto/spec/IvParameterSpec;": "Crypto IV usage",
    "Landroid/telephony/SmsManager;->sendTextMessage": "Silent SMS sending",
    "Landroid/content/pm/PackageManager;->setComponentEnabledSetting": "Component toggling (icon hiding)",
}

URL_PATTERN = re.compile(r'https?://[a-zA-Z0-9\-._~:/?#\[\]@!$&\'()*+,;=%]+')

MAX_APK_SIZE = 300 * 1024 * 1024        # 300 MB cap on the uploaded file itself
MAX_UNCOMPRESSED_TOTAL = 800 * 1024 * 1024  # 800 MB cap on total decompressed content
MAX_SINGLE_FILE = 100 * 1024 * 1024     # 100 MB cap per entry read into memory


def _check_zip_bomb(z: zipfile.ZipFile):
    """Raise if the archive's declared uncompressed size is unreasonable."""
    total_uncompressed = 0
    for info in z.infolist():
        if info.file_size > MAX_SINGLE_FILE:
            raise ValueError(f"Entry '{info.filename}' exceeds per-file size limit")
        total_uncompressed += info.file_size
        if total_uncompressed > MAX_UNCOMPRESSED_TOTAL:
            raise ValueError("Archive exceeds total uncompressed size limit (possible zip bomb)")


def scan_zip_contents(apk_path: str) -> dict:
    """Single pass over the zip: URLs (from text-ish files + dex) and
    suspicious API signatures (from dex only, since those are real bytecode refs)."""
    found_urls = set()
    unverified_urls = set()
    found_apis = set()

    with zipfile.ZipFile(apk_path, 'r') as z:
        _check_zip_bomb(z)

        for name in z.namelist():
            try:
                if name.endswith(('.xml', '.js', '.html', '.txt', '.json')):
                    content = z.read(name).decode('utf-8', errors='ignore')
                    for url in URL_PATTERN.findall(content):
                        if not any(safe in url for safe in [
                            'schemas.android.com', 'www.w3.org', 'xmlns',
                            'play.google.com/store', 'developer.android.com'
                        ]):
                            found_urls.add(url)

                elif name.endswith('.dex'):
                    content = z.read(name).decode('latin-1', errors='ignore')

                    # URLs from dex are heuristic — bytecode can produce
                    # accidental byte sequences that look like URLs.
                    for url in URL_PATTERN.findall(content):
                        if not any(safe in url for safe in [
                            'schemas.android.com', 'www.w3.org', 'xmlns'
                        ]):
                            if 10 < len(url) < 200:
                                unverified_urls.add(url)

                    # Real API signature scan — smali type descriptors
                    # actually show up as literal strings in the dex.
                    for pattern, label in SUSPICIOUS_API_PATTERNS.items():
                        if pattern in content:
                            found_apis.add(label)

            except Exception:
                continue

    return {
        "urls_found": list(found_urls)[:30],
        "urls_unverified": list(unverified_urls)[:30],
        "suspicious_apis": list(found_apis),
    }


def analyze_apk(apk_path: str) -> dict:
    try:
        if not os.path.exists(apk_path):
            return {"error": "File not found"}

        if os.path.getsize(apk_path) > MAX_APK_SIZE:
            return {"error": f"File exceeds max allowed size of {MAX_APK_SIZE // (1024*1024)}MB"}

        a = APK(apk_path)

        all_permissions = a.get_permissions()

        dangerous = [
            p for p in all_permissions
            if any(dp in p for dp in DANGEROUS_PERMISSIONS)
        ]

        network = [
            p for p in all_permissions
            if any(np in p for np in NETWORK_PERMISSIONS)
        ]

        try:
            zip_results = scan_zip_contents(apk_path)
        except ValueError as e:
            # Zip bomb / oversized entry — treat as a hard error, don't silently continue
            return {"error": f"Archive rejected: {str(e)}"}

        return {
            "package_name": a.get_package(),
            "app_name": a.get_app_name(),
            "version": a.get_androidversion_name(),
            "min_sdk": a.get_min_sdk_version(),
            "target_sdk": a.get_target_sdk_version(),
            "all_permissions": all_permissions,
            "dangerous_permissions": dangerous,
            "network_permissions": network,
            "activities": list(a.get_activities()),
            "services": list(a.get_services()),
            "receivers": list(a.get_receivers()),
            "urls_found": zip_results["urls_found"],
            "urls_unverified": zip_results["urls_unverified"],
            "suspicious_apis": zip_results["suspicious_apis"],
        }

    except Exception as e:
        return {"error": str(e)}