import { checkNavigationSequence } from "./sequenceBasedAnomaly";
import { checkSlidingWindowAttack } from "./slidingWindowDetection";

export const detection = async (counts, bufferSnapshot) => {
    console.log("Running detection...");
    let attackIps = new Set();

    const threshold = Number(process.env.DETECTION_THRESHOLD);
    console.log(`Threshold: ${threshold}`);

    for (const [key, count] of counts.entries()) {
        const [ip, action] = key.split('#');
        console.log(`   ${ip}: ${count} ${action}`);
        
        if (action === 'LOGIN_FAILURE') {
            let flagged = false;
            
            if(count > threshold) {
                console.log(`   FLAGGED: ${ip} (${count} > ${threshold})`);
                flagged = true;
            }

            const item = bufferSnapshot.find(log => log.meta?.ip === ip && log.action === 'LOGIN_FAILURE');
            if(item) {
                const result = await checkSlidingWindowAttack(ip, item.timestamp);
                if(result.anomaly) {
                    console.log(`   FLAGGED (SLIDING WINDOW): ${ip} - count=${result.count}`);
                    flagged = true;
                }
            }

            if(flagged) {
                attackIps.add(ip);
            }
        }
    }

    for (const item of bufferSnapshot) {
        const ip = item.meta?.ip;
        const userId = item.meta?.userId;
        const path = item.meta?.path;

        let sequenceAnomaly = false;

        if(userId && path) {
            const seqResult = await checkNavigationSequence(userId, path);

            if(seqResult.anomaly) {
                console.log(`   SEQUENCE FLAGGED: ${seqResult.msg}`);
                sequenceAnomaly = true;
                attackIps.add(ip);
            }
        }

        if (ip && attackIps.has(ip)) {
            item.isAttack = true;
            item.level = 'CRITICAL';
        } else {
            item.isAttack = false;
        }
    }

    return attackIps;
};