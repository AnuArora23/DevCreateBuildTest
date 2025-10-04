import { Router } from "express";
import * as controller from "../controllers/auth.controller.js";
import { verifyJWT } from "../utils/JWT.js";

const authRouter = Router();
authRouter.post("/register", controller.register);
authRouter.post("/login", controller.login);
authRouter.get("/auth0/redirect", controller.auth0_redirect);
authRouter.get("/profile", verifyJWT, controller.register);

export default authRouter;
