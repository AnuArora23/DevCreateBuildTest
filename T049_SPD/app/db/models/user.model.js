import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    authProvider: {
      type: String,
      enum: ["auth0", "local"], // 'auth0' = via Auth0, 'local' = email/password
      required: true,
    },

    name: {
      type: String,
      required: false,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // For local email/password users
    passwordHash: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
      select: false,
    },

    // For Auth0 users
    auth0Id: {
      type: String,
      required: function () {
        return this.authProvider === "auth0";
      },
      unique: function () {
        return this.authProvider === "auth0";
      },
    },

    picture: {
      type: String,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // For sending FCM push notifications
    fcmToken: {
      type: String,
      required: false,
      default: null,
    },

    // Optional: fields that user subscribes to alerts for
    subscribedFieldIds: [
      {
        type: String, // IDs of the fields this user wants alerts for
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for fast FCM notifications by subscribedFieldIds
userSchema.index({ subscribedFieldIds: 1 });

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
