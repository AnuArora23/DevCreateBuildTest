from twilio.rest import Client
import os
from dotenv import load_dotenv

load_dotenv()

TWILIO_SID = os.getenv("TWILIO_SID")
TWILIO_AUTH = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE = os.getenv("TWILIO_PHONE")
MY_PHONE = os.getenv("MY_PHONE")

client = Client(TWILIO_SID, TWILIO_AUTH)

try:
    msg = client.messages.create(
        body="🌱 Test SMS from Plant Doctor project!", from_=TWILIO_PHONE, to=MY_PHONE
    )
    print("✅ SMS sent, SID:", msg.sid)
except Exception as e:
    print("❌ Error:", e)
