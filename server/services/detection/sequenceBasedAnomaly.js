import Redis from "ioredis";
const redis = Redis();

const validTransitions = {
    '/login': ['/dashboard', '/profile'],
    '/dashboard': ['/settings', '/logout', '/products'],
    '/products': ['/cart'],
    '/cart': ['/checkout'],
    '/checkout': ['/payment-success'],
};

export const checkNavigationSequence = async (userId, path) => {
    const key = `user_path:${userId}`;
    const lastPath = await redis.get(key);

    await redis.setex(key, 3600, path);

    if(!lastPath) return {anomaly:false}

    const allowedNext = validTransitions[lastPath] || [];

    if(!allowedNext.includes(path)) {
        return {
            anomaly: true,
            msg: `Illegal Sequence: Jumped from ${lastPath} to ${currentPath}`
        }
    } 

    return {
        anomaly:false
    };
}