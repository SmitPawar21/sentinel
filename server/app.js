import express from "express"
import dotenv from "dotenv"
import logRoutes from "./routers/log.routes.js";
import { getSSEClients } from "./services/sse/SSEManager.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/logs", logRoutes);
app.use("/sse/stream", getSSEClients);

app.get('/health', (req, res) => {
    res.status(200).json({status: "OK"});
});

export default app;