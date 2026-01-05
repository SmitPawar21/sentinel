import { avgResTime, getAttackDetails, getAttackIps, getAttacksPerMin, getCountOfLogs, topServices } from "../services/analytics/log.analytics.js";
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
        const totalLogs = await getCountOfLogs();
        const totalAttackIps = await getAttackIps();
        const avgResponseTime = await avgResTime();
        const attackReasons = await getAttackDetails();

        res.status(200).json({
            "summary": {
                totalLogs, // total database log entries
                totalAttackIpsCount: totalAttackIps.length, // count of attack ips
                avgResponseTime 
            },

            attacksPerMinResult, // array of objects {minute, count}

            topServicesResult,

            "attacks": {
                totalAttackIps, // list of unique attack ips
                attackReasons, // ip's and their associated threat reason
            }
        })

    } catch (err) {
        res.status(500).json({error: `analytics error: ${err}`});
    }
}