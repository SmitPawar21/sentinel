export const detection = (counts, bufferSnapshot) => {
    console.log("Running detection...");
    let attackIps = new Set();

    const threshold = Number(process.env.DETECTION_THRESHOLD);
    console.log(`Threshold: ${threshold}`);

    for (const [key, count] of counts.entries()) {
        const [ip, action] = key.split('#');
        console.log(`   ${ip}: ${count} ${action}`);
        
        if (action === 'LOGIN_FAILURE' && count > threshold) {
            console.log(`   FLAGGED: ${ip} (${count} > ${threshold})`);
            attackIps.add(ip);
        }
    }

    for (const item of bufferSnapshot) {
        const ip = item.meta?.ip;
        if (ip && attackIps.has(ip)) {
            item.isAttack = true;
            item.level = 'CRITICAL';
        } else {
            item.isAttack = false;
        }
    }

    return attackIps;
};