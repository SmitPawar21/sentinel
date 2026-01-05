import axios from "axios";
import pLimit from "p-limit";

const API_URL = "http://localhost:3000";


const limit = pLimit(50);
// This means atmost 50 promises wil run simultaneously

const sendGoodRequests = async (count) => {
    const promises = [];
    for (let i = 0; i < count; i++) {
        promises.push(
            limit(() => {
                axios.post(`${API_URL}/logs/`, {
                    timestamp: new Date(),
                    serviceName: "ProductService",
                    level: "INFO",
                    message: "Page viewed successfully",
                    action: "PAGE_VIEW",
                    meta: {
                        userId: `user_${Math.floor(Math.random() * 10)}`,   
                        path: '/login',                                 
                        ip: `192.168.1.${Math.floor(Math.random() * 200)}`,
                        responseTime: Math.floor(Math.random() * 200),
                    }
                }).catch((e) => console.log(e.message))
            })
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
            limit(() => {
                axios.post(`${API_URL}/logs/`, {
                    timestamp: new Date(),
                    serviceName: "ProductService",
                    level: "ERROR",
                    message: "User login failed",
                    action: "LOGIN_FAILURE",
                    meta: {
                        userId: `user_${Math.floor(Math.random() * 10)}`,   
                        path: randomPath(),                                 
                        ip: attackIP,
                        responseTime: Math.floor(Math.random() * 500),
                    }
                }).catch((e) => console.log(e))
            })
        );
    }
    await Promise.all(promises);
    console.log("✓ ATTACK TRAFFIC SENT");
};

// RANDOM PATH
function randomPath() {
    const paths = [
        '/login',
        '/dashboard',
        '/profile',
        '/settings',
        '/products',
        '/cart',
        '/checkout',
        '/payment-success'
    ];

    if (Math.random() < 0.3) {
        return paths[Math.floor(Math.random() * paths.length)];
    }

    const flow = [
        ['/login', '/dashboard'],
        ['/dashboard', '/products'],
        ['/products', '/cart'],
        ['/cart', '/checkout'],
        ['/checkout', '/payment-success']
    ];

    const step = flow[Math.floor(Math.random() * flow.length)];
    return Math.random() < 0.5 ? step[0] : step[1];
}

const runTest = async () => {
    console.log("Starting test...");
    await sendGoodRequests(100);

    console.log("Sending attack requests from single IP...");
    await sendAttackRequests(50);

    console.log("Waiting for flush...");
    await new Promise((res) => setTimeout(res, 10000));

    console.log("✓ Test completed - check logs for isAttack: true");
};

runTest();