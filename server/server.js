import app from "./app";
import { connectDB } from "./config/dbConnection.js";
import { flushBuffer } from "./services/buffer/buffer.flusher.js";

const PORT = 3000;

await connectDB();

setInterval(() => {
  flushBuffer().catch(console.error);
}, process.env.FLUSH_INTERVAL_MS);

app.listen(PORT, () => {
    console.log(`Server started on PORT: ${PORT}`);
});