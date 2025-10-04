import { auth } from "express-openid-connect";
import { oidcConfig } from "../config/auth0.js";
import authRouter from "./routes/auth.routes.js";
import soilHealthRouter from "./routes/soilHealth.routes.js";
import weatherRouter from "./routes/weather.routes.js";
import marketPriceRouter from "./routes/marketPrice.routes.js";
import chatBotRouter from "./routes/chatBot.routes.js";

const bootstrap = (app) => {
  app.use(auth(oidcConfig));
  app.use("/api/auth", authRouter);
  app.use("/api/soilHealth", soilHealthRouter);
  app.use("/api/weather", weatherRouter);
  app.use("/api/marketPrice", marketPriceRouter);
  app.use("/api/chatBot", chatBotRouter);
};

export default bootstrap;
