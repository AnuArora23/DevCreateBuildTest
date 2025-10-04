import { fcm } from "../../config/firebase.js";

/**
 * Send push notification to a device using FCM token
 * @param {string} token - FCM device token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 */
export const sendFCMAlert = async (token, title, body) => {
  try {
    const message = {
      token,
      notification: {
        title,
        body,
      },
      android: { priority: "high" },
      apns: { headers: { "apns-priority": "10" } },
    };

    await fcm.send(message);
    console.log("FCM alert sent to token:", token);
  } catch (err) {
    console.error("Error sending FCM alert:", err.message);
  }
};
