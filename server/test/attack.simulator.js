import axios from "axios";

const API_URL = "http://localhost:3000";

const sendGoodRequests = async (count) => {
    const promises = [];
    for (let i = 0; i < count; i++) {
        promises.push(
            axios.post(`${API_URL}/logs/`, {
                timestamp: new Date(),
                serviceName: "AuthService",
                level: "INFO",
                message: "Page viewed successfully",
                action: "PAGE_VIEW",
                meta: {
                    ip: `192.168.1.${Math.floor(Math.random() * 200)}`,
                    responseTime: Math.floor(Math.random() * 200),
                }
            }).catch((e) => console.log(e.message))
        );
    }
    await Promise.all(promises);
    console.log("✓ GOOD TRAFFIC SENT");
};

const sendAttackRequests = async (count) => {
    const attackIP = "203.0.113.99";
    const promises = [];
    for (let i = 0; i < count; i++) {
        promises.push(
            axios.post(`${API_URL}/logs/`, {
                timestamp: new Date(),
                serviceName: "AuthService",
                level: "ERROR",
                message: "User login failed",
                action: "LOGIN_FAILURE",
                meta: {
                    ip: attackIP,
                    responseTime: Math.floor(Math.random() * 500),
                },
            }).catch((e) => console.log(e.message))
        );
    }
    await Promise.all(promises);
    console.log("✓ ATTACK TRAFFIC SENT");
};

const runTest = async () => {
    console.log("Starting test...");
    await sendGoodRequests(1000);
    
    console.log("Sending attack requests from single IP...");
    await sendAttackRequests(500);
    
    console.log("Waiting for flush...");
    await new Promise((res) => setTimeout(res, 10000));
    
    console.log("✓ Test completed - check logs for isAttack: true");
};

runTest();