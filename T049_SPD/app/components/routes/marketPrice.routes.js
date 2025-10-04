import express from "express";
import { fetchEnamData } from "../controllers/marketPrice.controller.js";

const marketPriceRouter = express.Router();

marketPriceRouter.post("/enam/trade-data", fetchEnamData);

export default marketPriceRouter;
