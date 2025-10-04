# backend/app.py
import os, json, base64, datetime, requests
from pathlib import Path
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from fpdf import FPDF

# ---- Your ML/Chat modules ----
from predict import load_model_bundle, predict_image, match_treatment_label
from chatbot import build_reply

# ==============================
# Paths & Config
# ==============================
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True, parents=True)
UPLOAD_DIR = DATA_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True, parents=True)
MODEL_DIR = DATA_DIR / "model"
TREATMENTS_FILE = DATA_DIR / "treatments.json"

# Frontend folder (../frontend)
FRONTEND_DIR = (BASE_DIR.parent / "frontend").resolve()

ALLOWED = {"png", "jpg", "jpeg", "webp"}

# Admin (also present in your .env, but keeping default fallback)
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "PLANTS_DOCTOR")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Aayu@018")


# ==============================
# Helpers
# ==============================
def allowed_file(fn: str) -> bool:
    return "." in fn and fn.rsplit(".", 1)[1].lower() in ALLOWED


def read_treatments():
    if not TREATMENTS_FILE.exists():
        return {}
    with open(TREATMENTS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def write_treatments(data: dict):
    with open(TREATMENTS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Basic "):
            return jsonify({"error": "Authorization header missing"}), 401
        try:
            raw = base64.b64decode(auth.split(" ", 1)[1]).decode("utf-8")
            username, password = raw.split(":", 1)
            if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
                return f(*args, **kwargs)
        except Exception:
            pass
        return jsonify({"error": "Invalid credentials"}), 401

    return wrapper


# ==============================
# Flask App
# ==============================
load_dotenv()
app = Flask(__name__, static_folder=str(FRONTEND_DIR), static_url_path="")
CORS(app)

# preload model once (safe even if weights missing – your function should handle)
MODEL_BUNDLE = load_model_bundle(MODEL_DIR)


# ==============================
# Frontend Routes
# ==============================
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    target = FRONTEND_DIR / path
    if path and target.exists():
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(UPLOAD_DIR, filename)


# ==============================
# Health
# ==============================
@app.get("/api/v1/health")
def health():
    return jsonify(
        {
            "ok": True,
            "model_loaded": MODEL_BUNDLE.get("loaded"),
            "model_flavor": MODEL_BUNDLE.get("flavor"),
            "num_classes": len(MODEL_BUNDLE.get("classes", [])),
        }
    )


# ==============================
# Prediction
# ==============================
@app.post("/api/v1/predict")
def api_predict():
    litres = float(request.form.get("litres", "0") or 0)
    file = request.files.get("file") or request.files.get("image")
    lang = request.form.get("lang", "en")

    if not file or file.filename == "":
        return jsonify({"error": "no file uploaded"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "unsupported file type"}), 400

    fname = secure_filename(file.filename)
    fpath = UPLOAD_DIR / fname
    file.save(fpath)

    # Run model prediction
    result = predict_image(str(fpath), MODEL_BUNDLE, topk=3)
    raw_label = result.get("label", "unknown")

    # Read treatments.json
    tdata_all = read_treatments()
    matched_label = match_treatment_label(raw_label, tdata_all)

    # If disease found in JSON
    if matched_label in tdata_all:
        tdata = tdata_all.get(matched_label, {})
        meds = tdata.get("medicines", [])

        # litres ke hisaab se dose calc
        if litres and meds:
            for m in meds:
                if "dose_per_litre_g" in m:
                    m["dose_g"] = float(m["dose_per_litre_g"]) * litres
                if "dose_per_litre_ml" in m:
                    m["dose_ml"] = float(m["dose_per_litre_ml"]) * litres

        result.update(
            {
                "label": matched_label,
                "image_url": f"/uploads/{fname}",
                "treatments": {
                    "symptoms_en": tdata.get("symptoms_en", "Not available"),
                    "symptoms_hi": tdata.get("symptoms_hi", "उपलब्ध नहीं"),
                    "treatment_en": tdata.get("treatment_en", "Not available"),
                    "treatment_hi": tdata.get("treatment_hi", "उपलब्ध नहीं"),
                    "prevention_en": tdata.get("prevention_en", "Not available"),
                    "prevention_hi": tdata.get("prevention_hi", "उपलब्ध नहीं"),
                    "dosage_en": tdata.get("dosage_en", "Not available"),
                    "dosage_hi": tdata.get("dosage_hi", "उपलब्ध नहीं"),
                    "summary_en": tdata.get("summary_en", "Not available"),
                    "summary_hi": tdata.get("summary_hi", "उपलब्ध नहीं"),
                    "medicines": meds,
                },
            }
        )
        return jsonify(result)

    # If healthy detected
    if "healthy" in raw_label.lower():
        return jsonify(
            {
                "label": "Healthy Plant 🌱",
                "image_url": f"/uploads/{fname}",
                "treatments": {
                    "symptoms_en": "No visible disease. Leaves look green and fresh.",
                    "symptoms_hi": "कोई बीमारी नहीं। पत्ते हरे और स्वस्थ हैं।",
                    "treatment_en": "No treatment required.",
                    "treatment_hi": "कोई इलाज आवश्यक नहीं।",
                    "prevention_en": "Maintain regular care and watering.",
                    "prevention_hi": "नियमित देखभाल और सिंचाई करें।",
                    "dosage_en": "Not applicable.",
                    "dosage_hi": "लागू नहीं।",
                    "summary_en": "This plant is healthy.",
                    "summary_hi": "यह पौधा स्वस्थ है।",
                    "medicines": [],
                },
            }
        )

    # Unknown fallback
    return jsonify(
        {
            "label": "Unknown disease detected ❓",
            "image_url": f"/uploads/{fname}",
            "treatments": {
                "symptoms_en": "Not found in knowledge base.",
                "symptoms_hi": "ज्ञानकोष में जानकारी नहीं मिली।",
                "treatment_en": "Try uploading another clear photo.",
                "treatment_hi": "कृपया एक और स्पष्ट फोटो अपलोड करें।",
                "prevention_en": "Ensure good agricultural practices.",
                "prevention_hi": "अच्छी कृषि पद्धतियाँ अपनाएँ।",
                "dosage_en": "Not available.",
                "dosage_hi": "उपलब्ध नहीं।",
                "summary_en": "No details available.",
                "summary_hi": "विवरण उपलब्ध नहीं।",
                "medicines": [],
            },
        }
    )


# ==============================
# Smart Report PDF (Bilingual)
# ==============================
@app.post("/api/v1/report")
def generate_report():
    data = request.json or {}
    label = data.get("label", "Unknown")
    treatments = data.get("treatments", {})

    try:
        pdf = FPDF()
        pdf.add_page()

        # Title
        pdf.set_font("Arial", "B", 16)
        title = "🌱 Smart Plant Health Report / स्मार्ट पौधा स्वास्थ्य रिपोर्ट"
        pdf.cell(
            200,
            10,
            title.encode("latin-1", "ignore").decode("latin-1"),
            ln=True,
            align="C",
        )

        # Date/Time
        pdf.set_font("Arial", "", 12)
        dt = f"Date / दिनांक: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        pdf.cell(200, 10, dt.encode("latin-1", "ignore").decode("latin-1"), ln=True)
        pdf.ln(8)

        # Disease
        pdf.set_font("Arial", "B", 13)
        dis = f"Disease Detected / बीमारी: {label}"
        pdf.cell(200, 10, dis.encode("latin-1", "ignore").decode("latin-1"), ln=True)

        pdf.set_font("Arial", "", 11)

        def bi(en_key, hi_key, head_en, head_hi):
            head = f"{head_en} / {head_hi}:"
            body = (
                f"{treatments.get(en_key,'N/A')}\n{treatments.get(hi_key,'उपलब्ध नहीं')}"
            )
            pdf.multi_cell(0, 8, head.encode("latin-1", "ignore").decode("latin-1"))
            pdf.multi_cell(0, 8, body.encode("latin-1", "ignore").decode("latin-1"))
            pdf.ln(2)

        bi("symptoms_en", "symptoms_hi", "Symptoms", "लक्षण")
        bi("treatment_en", "treatment_hi", "Treatment", "इलाज")
        bi("prevention_en", "prevention_hi", "Prevention", "रोकथाम")
        bi("dosage_en", "dosage_hi", "Dosage", "खुराक")
        bi("summary_en", "summary_hi", "Summary", "सारांश")

        meds = treatments.get("medicines", [])
        if meds:
            pdf.set_font("Arial", "B", 12)
            cap = "💊 Medicines / दवाइयाँ:"
            pdf.cell(
                200, 10, cap.encode("latin-1", "ignore").decode("latin-1"), ln=True
            )
            pdf.set_font("Arial", "", 11)
            for m in meds:
                dose = m.get("dose_g") or m.get("dose_ml") or ""
                line = f"- {m.get('name','')} | Dose / खुराक: {dose}"
                pdf.multi_cell(0, 8, line.encode("latin-1", "ignore").decode("latin-1"))

        pdf_bytes = pdf.output(dest="S").encode("latin-1", "ignore")
        return app.response_class(
            pdf_bytes,
            mimetype="application/pdf",
            headers={"Content-Disposition": "attachment;filename=Plant_Report.pdf"},
        )
    except Exception as e:
        print("❌ PDF Error:", e)
        return jsonify({"error": "Failed to generate report"}), 500



# ==============================
# Chatbot
# ==============================
from langdetect import detect  # 👈 import langdetect at the top of file

treatments_data = read_treatments()


@app.post("/api/v1/chat")
def api_chat():
    payload = request.json or {}
    raw_msg = payload.get("message", "")
    msg = raw_msg.strip() if isinstance(raw_msg, str) else ""

    # अगर frontend ने lang दिया है तो वही use करो, वरना auto detect
    lang = payload.get("lang")
    if not lang:
        try:
            detected = detect(msg)
            lang = "hi" if detected.startswith("hi") else "en"
        except Exception:
            lang = "en"

    if not msg:
        return jsonify({"error": "message is required"}), 400

    # Chatbot reply
    reply = build_reply(msg, treatments_data, lang=lang)
    if reply.get("intent") and reply["intent"] != "unknown":
        return jsonify(
            {
                "text": reply["text"],
                "lang": lang,
                "disease": reply.get("disease"),
                "suggestions": reply.get("suggestions", []),
            }
        )

    # fallback if unknown
    return jsonify(
        {
            "text": (
                "Sorry, I don't have info about this. Try uploading a plant photo 🌱"
                if lang == "en"
                else "क्षमा करें 🙏, मेरे पास इस बारे में जानकारी नहीं है। कृपया पौधे की फोटो अपलोड करें 🌱"
            ),
            "lang": lang,
            "disease": None,
            "suggestions": [],
        }
    )


# ==============================
# Weather APIs
# ==============================
@app.get("/api/v1/weather")
def get_weather():
    city = request.args.get("city")
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    weather_key = os.getenv("WEATHER_API_KEY")
    geocode_key = os.getenv("OPENCAGE_API_KEY") or os.getenv("OPENCAGE_KEY")

    if not weather_key:
        return jsonify({"error": "Weather API key missing"}), 500

    # If lat/lon given → reverse geocode
    if lat and lon and geocode_key:
        try:
            geo_url = f"https://api.opencagedata.com/geocode/v1/json?q={lat}+{lon}&key={geocode_key}&language=en"
            g = requests.get(geo_url, timeout=6).json()
            if g.get("results"):
                comp = g["results"][0]["components"]
                city = (
                    comp.get("city")
                    or comp.get("town")
                    or comp.get("village")
                    or comp.get("county")
                    or city
                )
        except Exception as e:
            print("⚠️ Reverse geocoding error:", e)

    if not city:
        city = "Delhi"

    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={weather_key}&units=metric"
        r = requests.get(url, timeout=8).json()
        if "main" not in r:
            return jsonify({"error": "City not found"}), 404

        return jsonify(
            {
                "city": city,
                "temp": r["main"]["temp"],
                "feels_like": r["main"]["feels_like"],
                "humidity": r["main"]["humidity"],
                "condition": r["weather"][0]["description"].title(),
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/v1/forecast")
def forecast():
    city = request.args.get("city", "Delhi")
    API_KEY = os.getenv("WEATHER_API_KEY")
    if not API_KEY:
        return jsonify({"ok": False, "error": "Weather API key missing"}), 500
    try:
        url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}&units=metric"
        data = requests.get(url, timeout=10).json()
        if data.get("cod") != "200":
            return (
                jsonify({"ok": False, "error": data.get("message", "API error")}),
                400,
            )

        out = []
        for item in data.get("list", [])[:24:8]:  # 3 entries ~ next 3 days (24h apart)
            out.append(
                {
                    "day": item["dt_txt"].split(" ")[0],
                    "temp": item["main"]["temp"],
                    "rain": round(item.get("pop", 0) * 100, 1),
                    "humidity": item["main"]["humidity"],
                    "wind": item["wind"]["speed"],
                }
            )
        return jsonify({"ok": True, "city": city, "forecast": out})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)})


# ==============================
# Twilio SMS Weather Alert
# ==============================
from twilio.rest import Client

TWILIO_SID = os.getenv("TWILIO_SID")
TWILIO_AUTH = os.getenv("TWILIO_AUTH_TOKEN")  # matches your .env
TWILIO_PHONE = os.getenv("TWILIO_PHONE")


def send_weather_sms(to_number, message):
    try:
        client = Client(TWILIO_SID, TWILIO_AUTH)
        msg = client.messages.create(body=message, from_=TWILIO_PHONE, to=to_number)
        return True, msg.sid
    except Exception as e:
        return False, str(e)


@app.post("/api/v1/send-alert")
def send_alert():
    payload = request.json or {}
    phone = payload.get("phone")
    city = payload.get("city", "Delhi")
    if not phone:
        return jsonify({"ok": False, "error": "Phone number required"}), 400
    try:
        API_KEY = os.getenv("WEATHER_API_KEY")
        url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}&units=metric"
        res = requests.get(url, timeout=10).json()
        rain_alerts = [f for f in res.get("list", [])[:24] if f.get("pop", 0) > 0.6]
        if rain_alerts:
            msg = f"🌧 Rain Alert in {city}! High chance of rain today. Protect your crops. 🌱"
        else:
            msg = f"☀ Weather is clear today in {city}. Continue normal farming activities."
        ok, sid = send_weather_sms(phone, msg)
        return jsonify({"ok": ok, "sid": sid, "message": msg})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


# ==============================
# 📈 Market Price Tracking
# ==============================
MARKET_FILE = DATA_DIR / "market_prices.json"
ALERTS_FILE = DATA_DIR / "price_alerts.json"


def read_market():
    if not MARKET_FILE.exists():
        return {"commodities": []}
    with open(MARKET_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def write_market(data: dict):
    with open(MARKET_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def read_price_alerts():
    if not ALERTS_FILE.exists():
        return {"subs": []}
    with open(ALERTS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def write_price_alerts(data: dict):
    with open(ALERTS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


@app.get("/api/v1/market")
def api_market_list():
    items = read_market().get("commodities", [])
    q = request.args.get("commodity")
    city = request.args.get("city")
    if q:
        items = [
            x
            for x in items
            if x.get("commodity_en", "").lower() == q.lower()
            or x.get("commodity_hi", "") == q
        ]
    if city:
        items = [x for x in items if x.get("city", "").lower() == city.lower()]
    return jsonify({"ok": True, "count": len(items), "items": items})


@app.post("/api/v1/market")
@admin_required
def api_market_upsert():
    payload = request.json or {}
    if not payload.get("commodity_en"):
        return jsonify({"ok": False, "error": "commodity_en required"}), 400
    data = read_market()
    items = data.get("commodities", [])
    key_en = payload["commodity_en"].strip().lower()
    updated = False
    for it in items:
        if (
            it.get("commodity_en", "").strip().lower() == key_en
            and it.get("city", "").lower() == payload.get("city", "").lower()
        ):
            it.update(payload)
            it["updated_at"] = datetime.datetime.now().isoformat()
            updated = True
            break
    if not updated:
        payload["updated_at"] = datetime.datetime.now().isoformat()
        items.append(payload)
    data["commodities"] = items
    write_market(data)
    return jsonify({"ok": True, "item": payload})


@app.post("/api/v1/price-alert/subscribe")
def api_price_alert_sub():
    p = request.json or {}
    if not p.get("phone") or not p.get("commodity") or p.get("threshold") is None:
        return (
            jsonify({"ok": False, "error": "phone, commodity, threshold required"}),
            400,
        )
    data = read_price_alerts()
    subs = data.get("subs", [])
    subs.append(
        {
            "phone": p["phone"],
            "commodity": p["commodity"],
            "threshold": float(p["threshold"]),
            "direction": p.get("direction", "below"),
        }
    )
    data["subs"] = subs
    write_price_alerts(data)
    return jsonify({"ok": True, "count": len(subs)})


# ==============================
# Run
# ==============================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
