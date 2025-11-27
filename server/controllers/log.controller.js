import { getAttacksPerMin, topServices } from "../services/analytics/log.analytics.js";
import { flushBuffer } from "../services/buffer/buffer.flusher.js";
import { addLog, bufferFull, getBuffer } from "../services/buffer/log.buffer.js";

export const createLogs = async (req, res) => {
    const log = req.body;

    log.timestamp = new Date(log.timestamp || Date.now());
    addLog(log);

    res.status(200).json({ok: true});

    if(bufferFull()) {
        flushBuffer().catch(console.error);
    }
}

export const getLogs = (req, res) => {
    const snapshot = getBuffer();

    res.status(200).json({ok: true, snapshot})
}

export const getStats = async (req, res) => {
    try {
        const attacksPerMinResult = await getAttacksPerMin(); 
        const topServicesResult = await topServices();

        res.status(200).json({ok: true, attacksPerMinResult, topServicesResult});
    } catch (err) {
        res.status(500).json({error: `analytics error: ${err}`});
    }
}