import re
import difflib

# ==== Keywords for intent detection ====
INTENT_KEYWORDS = {
    "symptoms": ["symptom", "identify", "sign", "nishani", "lakshan"],
    "treatment": ["treat", "treatment", "medicine", "cure", "remedy", "dawai", "ilaj"],
    "prevention": ["prevent", "control", "avoid", "bachav", "roktham"],
    "dosage": ["dosage", "dose", "spray", "quantity", "how much", "kitna"],
}

# ==== Context Memory ====
LAST_CONTEXT = {"disease": None}

# ==== BASIC QA (Greetings + Small Talk) ====
BASIC_QA = {
    "hello": {
        "en": "Hello 👋! I am your Plant Doctor AI.",
        "hi": "नमस्ते 🙏! मैं आपका प्लांट डॉक्टर एआई हूँ।",
    },
    "hi": {"en": "Hi 👋! How are your plants today?", "hi": "हाय 👋! आपके पौधे कैसे हैं?"},
    "hey": {"en": "Hey there! 🌱", "hi": "अरे नमस्ते! 🌱"},
    "thanks": {"en": "You're welcome! 🌱", "hi": "आपका स्वागत है! 🌱"},
    "who are you": {"en": "I am Plant Doctor AI 🤖.", "hi": "मैं प्लांट डॉक्टर एआई हूँ 🤖।"},
    "good morning": {"en": "Good Morning ☀️!", "hi": "सुप्रभात ☀️!"},
    "good night": {"en": "Good Night 🌙.", "hi": "शुभ रात्रि 🌙।"},
}


def _norm(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _intent(msg: str) -> str:
    m = _norm(msg)
    for name, kws in INTENT_KEYWORDS.items():
        if any(k in m for k in kws):
            return name
    return "general"


def _find_disease(msg: str, diseases: list[str]):
    """Find closest disease name from treatments.json"""
    m = _norm(msg)
    for d in diseases:
        if d.lower() in m:
            return d
    guess = difflib.get_close_matches(m, diseases, n=1, cutoff=0.55)
    return guess[0] if guess else None


def build_reply(user_text: str, treatments_data: dict, lang: str = "en"):
    msg = _norm(user_text)

    # === YES / HAAN ===
    if msg in ["yes", "haan", "ok", "ji"]:
        if LAST_CONTEXT.get("disease"):
            disease = LAST_CONTEXT["disease"]
            info = treatments_data.get(disease, {})
            body = info.get(f"summary_{lang}", info.get("summary", "No info."))
            return {
                "text": f"{disease}: {body}",
                "intent": "disease_info",
                "disease": disease,
                "suggestions": [
                    f"{disease} symptoms",
                    f"{disease} treatment",
                    f"{disease} prevention",
                    f"{disease} dosage",
                ],
            }

    # === NO / NAHI ===
    if msg in ["no", "nahi", "nah", "na"]:
        return {
            "text": (
                "ठीक है 🙏, कोई और फसल पूछ सकते हैं।"
                if lang == "hi"
                else "Alright 🙏, you can ask about another crop."
            ),
            "intent": "basic",
            "disease": None,
            "suggestions": [],
        }

    # === BASIC QA ===
    for key, val in BASIC_QA.items():
        if key in msg:
            return {
                "text": val.get(lang, val["en"]),
                "intent": "basic",
                "disease": None,
                "suggestions": [],
            }

    # === Check in Knowledge Base ===
    diseases = list(treatments_data.keys())
    intent = _intent(user_text)
    disease = _find_disease(user_text, diseases)

    if disease:
        info = treatments_data.get(disease, {})
        if isinstance(info, dict):
            if intent == "symptoms":
                body = info.get(
                    f"symptoms_{lang}", info.get("symptoms", "Not available")
                )
            elif intent == "treatment":
                body = info.get(
                    f"treatment_{lang}", info.get("treatment", "Not available")
                )
            elif intent == "prevention":
                body = info.get(
                    f"prevention_{lang}", info.get("prevention", "Not available")
                )
            elif intent == "dosage":
                body = info.get(f"dosage_{lang}", info.get("dosage", "Not available"))
            else:
                body = info.get(f"summary_{lang}", info.get("summary", "No info."))
        else:
            body = str(info)

        LAST_CONTEXT["disease"] = disease
        return {
            "text": f"{disease}: {body}",
            "intent": intent,
            "disease": disease,
            "suggestions": [
                f"{disease} symptoms",
                f"{disease} treatment",
                f"{disease} prevention",
                f"{disease} dosage",
            ],
        }

    # === If only crop name is given (Tomato, Potato, Apple) ===
    crops = ["tomato", "potato", "apple"]
    for crop in crops:
        if crop in msg:
            related = [d for d in diseases if crop.lower() in d.lower()]
            if related:
                reply_lines = []
                for d in related:
                    info = treatments_data.get(d, {})
                    summary = info.get(
                        f"summary_{lang}", info.get("summary", "No info.")
                    )
                    reply_lines.append(f"👉 {d}: {summary}")
                LAST_CONTEXT["disease"] = related[0]
                return {
                    "text": "\n".join(reply_lines),
                    "intent": "crop_summary",
                    "disease": related[0],
                    "suggestions": [
                        f"{related[0]} symptoms",
                        f"{related[0]} treatment",
                        f"{related[0]} prevention",
                        f"{related[0]} dosage",
                    ],
                }

    # === Fallback ===
    return {
        "text": (
            "क्षमा करें 🙏, मेरे पास इसकी जानकारी नहीं है। पौधे की फोटो अपलोड करें 🌱"
            if lang == "hi"
            else "Sorry, I don’t have info. Try uploading a plant photo 🌱"
        ),
        "intent": "unknown",
        "disease": None,
        "suggestions": [],
    }
