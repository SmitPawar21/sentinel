import { bufferEmpty, clearBuffer, getBuffer } from "./log.buffer.js";
import logEntry from "../../model/logEntry.js";
import { broadcastAlert } from "../sse/SSEManager.js";
import { detection } from "../detection/log.detector.js";

let flushing = false;

function buildCounts(buffer) {
  const map = new Map();
  for (const item of buffer) {
    const ip = item.meta?.ip;

    if (item.action === 'LOGIN_FAILURE') {
      const key = `${ip}#LOGIN_FAILURE`;
      map.set(key, (map.get(key) || 0) + 1);
    }
  }
  return map; 
}

export const flushBuffer = async () => {
  
  if (flushing) return;
  if (bufferEmpty()) return;

  flushing = true;
  
  try {
        const bufferSnapshot = getBuffer();
        
        if (bufferSnapshot.length === 0) {
            flushing = false;
            return;
        }
        
        console.log(`\n>>> Flushing ${bufferSnapshot.length} logs`);
        
        const counts = buildCounts(bufferSnapshot);
        console.log("Counts:", counts);
        
        const attackIps = detection(counts, bufferSnapshot);
        console.log("Attack IPs found:", [...attackIps]);
        
        await logEntry.insertMany(bufferSnapshot, { ordered: false });
        console.log("Successfully inserted into database\n");
        
        if (attackIps.size) {
            broadcastAlert([...attackIps]);
        }
        
    } catch (err) {
        console.error(`Flush Error: ${err}`);
    } finally {
        flushing = false;
    }
} 