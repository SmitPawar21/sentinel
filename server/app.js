import express from "express"
import dotenv from "dotenv"
import logRoutes from "./routers/log.routes.js";
import { getSSEClients } from "./services/sse/SSEManager.js";
import cors from 'cors';

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({
    origin: '*',
    methods: ['POST', 'GET', 'PUT', 'DELETE']
}));

app.use("/logs", logRoutes);
app.use("/sse/stream", getSSEClients);

app.get('/health', (req, res) => {
    res.status(200).json({status: "OK"});
});

export default app;