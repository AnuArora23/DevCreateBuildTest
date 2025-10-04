import { Router } from "express";
import * as controller from "../controllers/weather.controller.js";

const weatherRouter = Router();

weatherRouter.post("/send-alert", controller.fetchWeatherFromAPI);

export default weatherRouter;
