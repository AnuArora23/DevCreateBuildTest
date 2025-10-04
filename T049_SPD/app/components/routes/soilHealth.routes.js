import { Router } from "express";
import { verifyJWT } from "../utils/JWT.js";
import * as controller from "../controllers/soilHealth.controller.js";

const soilHealthRouter = Router();

soilHealthRouter.post("/getSoilInfo", verifyJWT, controller.getSoilInfo);
soilHealthRouter.post(
  "/recommendFertilizerGuidelines",
  controller.getFertilizerRecommendation
);

export default soilHealthRouter;
