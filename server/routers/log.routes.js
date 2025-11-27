import express from "express";
import { createLogs, getLogs, getStats } from "../controllers/log.controller.js";
const router = express.Router();

router.post("/", createLogs);
router.get("/", getLogs);
router.get("/stats", getStats);

export default router;