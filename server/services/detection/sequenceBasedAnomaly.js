import Redis from "ioredis";
const redis = new Redis();

const validTransitions = {
    '/login': ['/dashboard', '/profile'],
    '/dashboard': ['/settings', '/logout', '/products'],
    '/products': ['/cart'],
    '/cart': ['/checkout'],
    '/checkout': ['/payment-success'],
};

const validStartPaths = ['/login', '/dashboard', '/products', '/cart', 'checkout'];

export const checkNavigationSequence = async (userId, path) => {
    const key = `user_path:${userId}`;
    const lastPath = await redis.get(key);

    await redis.setex(key, 3600, path);

    if(!lastPath) {
        if(validStartPaths.includes(path)) {
            return {anomaly:false}
        }
    }

    if(lastPath == path) {
        return {anomaly:false}
    }

    const allowedNext = validTransitions[lastPath] || [];

    if(!allowedNext.includes(path)) {
        return {
            anomaly: true,
            msg: `Illegal Sequence: Jumped from ${lastPath} to ${path}`
        }
    } 

    return {
        anomaly:false
    };
}