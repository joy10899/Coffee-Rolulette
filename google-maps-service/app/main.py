# google-maps-api-service/app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import requests
import os

# ---------- Load environment variables ----------
# .env must contain:
#   GOOGLE_MAPS_SERVER_KEY=...   (Places API, server-side)
#   GOOGLE_MAPS_EMBED_KEY=...    (Maps Embed API, browser iframe)
load_dotenv()
SERVER_KEY = os.environ.get("GOOGLE_MAPS_SERVER_KEY")
EMBED_KEY  = os.environ.get("GOOGLE_MAPS_EMBED_KEY")

app = FastAPI()

# ---------- CORS ----------
origins = [
    "http://127.0.0.1:3001",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Healthcheck ----------
@app.get("/health")
async def health():
    return {
        "ok": True,
        "has_server_key": bool(SERVER_KEY),
        "has_embed_key": bool(EMBED_KEY),
    }

# ---------- Place Details endpoint ----------
@app.get("/api/place-details")
async def get_place_details(query: str):
    """
    Search a place by free text and return a trimmed JSON:
    name, formatted_address, rating, user_ratings_total, top 3 short reviews,
    and a safe Google Maps embed URL (key stays on server).
    """
    if not SERVER_KEY or not EMBED_KEY:
        raise HTTPException(
            status_code=500,
            detail="Missing Google Maps keys (SERVER_KEY or EMBED_KEY).",
        )

    if not query or not query.strip():
        raise HTTPException(status_code=400, detail="Query must not be empty.")

    try:
        # ---- STEP 1: Find place_id from text ----
        find_place_url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
        find_params = {
            "input": query,
            "inputtype": "textquery",
            "fields": "place_id",
            "key": SERVER_KEY,  # server-side key
        }
        find_resp = requests.get(find_place_url, params=find_params, timeout=10)
        find_json = find_resp.json()

        print(f"[DEBUG] FIND_PLACE '{query}': {find_json}", flush=True)

        status = find_json.get("status")
        if status != "OK" or not find_json.get("candidates"):
            # Common statuses: ZERO_RESULTS, OVER_QUERY_LIMIT, REQUEST_DENIED, INVALID_REQUEST
            return {"error": f"FindPlace failed: {status or 'UNKNOWN'} for query '{query}'"}

        place_id = find_json["candidates"][0]["place_id"]

        # ---- STEP 2: Place Details (include reviews) ----
        details_url = "https://maps.googleapis.com/maps/api/place/details/json"
        details_params = {
            "place_id": place_id,
            "fields": "name,formatted_address,rating,user_ratings_total,reviews,url,photos",
            "key": SERVER_KEY,  # server-side key
            "language": "en",
        }
        details_resp = requests.get(details_url, params=details_params, timeout=10)
        details_json = details_resp.json()

        print(f"[DEBUG] DETAILS for place_id '{place_id}': {details_json.get('status')}", flush=True)

        d_status = details_json.get("status")
        if d_status != "OK":
            return {"error": f"Place Details failed: {d_status or 'UNKNOWN'}"}

        result = details_json.get("result", {}) or {}

        # ---- STEP 3: Build embed URL (browser renders with embed key) ----
        embed_url = f"https://www.google.com/maps/embed/v1/place?key={EMBED_KEY}&q=place_id:{place_id}"
        result["embed_url"] = embed_url

        # ---- Trim reviews (top 3, short) ----
        raw_reviews = result.get("reviews") or []
        light_reviews = []
        for r in raw_reviews[:3]:
            light_reviews.append({
                "author_name": r.get("author_name"),
                "rating": r.get("rating"),
                "relative_time_description": r.get("relative_time_description"),
                "text": (r.get("text") or "")[:280],
            })
        result["reviews"] = light_reviews

        # ---- Keep only fields the FE needs ----
        trimmed = {
            "name": result.get("name"),
            "formatted_address": result.get("formatted_address"),
            "rating": result.get("rating"),
            "user_ratings_total": result.get("user_ratings_total"),
            "reviews": result.get("reviews"),
            "embed_url": result.get("embed_url"),
        }
        return trimmed

    except requests.Timeout:
        raise HTTPException(status_code=504, detail="Google API timeout.")
    except Exception as e:
        print(f"[ERROR] Exception: {str(e)}", flush=True)
        raise HTTPException(status_code=500, detail=f"General API processing error: {str(e)}")
