import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./config/dbConnection.js";
import logRoutes from "./routers/log.routes.js";
import { getSSEClients } from "./services/sse/SSEManager.js";
import { flushBuffer } from "./services/buffer/buffer.flusher.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

connectDB();
app.use("/logs", logRoutes);
app.use("/sse/stream", getSSEClients);

setInterval(() => {
  flushBuffer().catch(console.error);
}, process.env.FLUSH_INTERVAL_MS);

app.get('/', (req, res) => {
    res.status(201).json({message: "Hello Smit"});
});

app.listen(PORT, () => {
    console.log(`Server started on PORT: ${PORT}`);
});