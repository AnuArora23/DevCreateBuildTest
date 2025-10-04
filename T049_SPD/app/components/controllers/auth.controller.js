import UserModel from "../../db/models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { signToken } from "../utils/JWT.js";
import bcrypt from "bcrypt";

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  const existing = await UserModel.findOne({ email: email.toLowerCase() });
  if (existing)
    return res.status(400).json({ error: "Email already registered" });

  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new UserModel({
    authProvider: "local",
    name,
    email: email.toLowerCase(),
    passwordHash,
  });

  await user.save();

  const token = signToken(user);
  res.json({
    token,
    user: { id: user._id, email: user.email, name: user.name },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  // include passwordHash for checking
  const user = await UserModel.findOne({
    email: email.toLowerCase(),
    authProvider: "local",
  }).select("+passwordHash");
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(user);
  res.json({
    token,
    user: { id: user._id, email: user.email, name: user.name },
  });
});

const auth0_redirect = asyncHandler(async (req, res) => {
  // express-openid-connect attaches req.oidc.user when authenticated
  if (!req.oidc?.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated with Auth0" });
  }

  const oidcUser = req.oidc.user;
  // oidcUser contains claims like sub, email, name, picture
  const auth0Id = oidcUser.sub;
  const email = (oidcUser.email || "").toLowerCase();

  // Find or create local user record for this Auth0 user
  let user = await UserModel.findOne({ auth0Id, authProvider: "auth0" });
  if (!user) {
    // If an account with same email exists as local, you may want to decide whether to merge or reject.
    // Here we prefer linking to a new auth0 record if same email exists with local provider.
    const existingLocal = await UserModel.findOne({ email });
    if (existingLocal) {
      // Option: link accounts (set auth0Id and change provider?) — here we keep separate and refuse linking automatically.
      // For clarity we will not auto-link; inform the user.
      // You can implement a linking flow (ask user for password then attach auth0Id).
      // For demonstration, we still create a new record with auth0 provider and same email (unique constraint will fail).
      // So we'll instead return an error asking the client to link accounts manually.
      return res.status(409).json({
        error:
          "An account with this email already exists as local. Implement a linking flow to connect Auth0 to your existing account.",
      });
    }

    user = new UserModel({
      authProvider: "auth0",
      auth0Id,
      email,
      name: oidcUser.name || oidcUser.nickname || "",
      picture: oidcUser.picture,
    });

    await user.save();
  }

  // issue our JWT
  const token = signToken(user);

  // Option A: respond JSON (for SPA clients)
  return res.json({
    token,
    user: { id: user._id, email: user.email, name: user.name },
  });

  // Option B: redirect to your front-end and include token as query fragment (less recommended)
  // res.redirect(`${FRONTEND_URL}/auth/success#token=${token}`);
});

const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.sub; // set by middleware
  const user = await UserModel.findById(userId).select("-passwordHash -__v");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

export { register, login, auth0_redirect, getProfile };
