const sseClients = new Set();

export const getSSEClients = async (req, res) => {
    res.set({
        'Content-type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        connection: 'keep-alive'
    });

    res.flushHeaders();
    res.write('retry: 2000\n\n');
    sseClients.add(res);

    req.on('close', () => sseClients.delete(res));
} 

export const broadcastAlert = (ips) => {
    console.log("AttackIps: ", ips);
    const payload = JSON.stringify({type: 'ATTACK', ips, ts: Date.now()});
    for(const res of sseClients) {
        try {
            res.write(`Event: alert\nData: ${payload}\n\n`);
        } catch (e) {
            console.error(e);
        }
    }
}