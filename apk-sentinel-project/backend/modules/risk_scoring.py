def calculate_risk(analysis: dict) -> dict:
    score = 0
    reasons = []

    # Each category below has its own point ceiling, so one very noisy
    # signal (e.g. 60 URLs) can't single-handedly blow the whole score
    # past 100 the way an uncapped per-item weight did before. The final
    # min(score, 100) is just a safety net for apps that are bad across
    # nearly every category at once — it shouldn't be what most scores
    # land on.

    dangerous = analysis.get("dangerous_permissions", [])
    if dangerous:
        points = min(len(dangerous) * 8, 25)
        score += points
        reasons.append(f"Found {len(dangerous)} dangerous permission(s): {', '.join(dangerous)}")

    network = analysis.get("network_permissions", [])
    if network:
        score += 5
        reasons.append("App requests internet access")

    urls = analysis.get("urls_found", [])
    if urls:
        points = min(len(urls) * 2, 15)
        score += points
        reasons.append(f"Found {len(urls)} confirmed URL(s) in app assets")

    unverified_urls = analysis.get("urls_unverified", [])
    if unverified_urls:
        points = min(round(len(unverified_urls) * 0.3), 10)  # lower weight — heuristic signal
        score += points
        reasons.append(f"Found {len(unverified_urls)} possible URL(s) in raw bytecode (unverified)")

    activities = analysis.get("activities", [])
    if len(activities) > 20:
        score += 15
        reasons.append(f"Unusually high number of activities ({len(activities)}) — possible injected SDKs")

    services = analysis.get("services", [])
    if len(services) > 5:
        score += 10
        reasons.append(f"High number of background services ({len(services)})")

    ad_sdks = ["applovin", "ironsource", "facebook", "admob", "unity3d",
               "vungle", "mbridge", "chartboost", "inmobi", "moloco"]
    found_ads = [sdk for sdk in ad_sdks
                 if any(sdk in a.lower() for a in activities)]
    if found_ads:
        points = min(len(found_ads) * 3, 10)
        score += points
        reasons.append(f"Contains ad SDKs: {', '.join(found_ads)}")

    suspicious_apis = analysis.get("suspicious_apis", [])
    if suspicious_apis:
        points = min(len(suspicious_apis) * 5, 20)
        score += points
        reasons.append(f"Suspicious APIs detected: {', '.join(suspicious_apis)}")

    # Category ceilings above sum to ~110, so this only ever clips an app
    # that's maxed out on nearly every signal simultaneously.
    score = min(score, 100)

    if score == 0:
        level = "Safe"
    elif score <= 30:
        level = "Suspicious"
    elif score <= 60:
        level = "High Risk"
    else:
        level = "Malicious"

    return {
        "score": score,
        "level": level,
        "reasons": reasons
    }
