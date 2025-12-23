import Redis from "ioredis";
const redis = new Redis();

const WINDOW_SIZE_SECONDS = 60;
const FAILURE_THRESHOLD = 10;

export const checkSlidingWindowAttack = async (ip, timestamp) => {
    const key = `failures:${ip}`;
    const windowStart = timestamp - (WINDOW_SIZE_SECONDS*1000);

    const pipeline = redis.pipeline();

    // Why use pipeline?

    //     Pipeline batches commands → fewer network round trips → faster.

    //     Without pipeline → Redis would run 4 separate commands.

    //     With pipeline → Redis processes all at once.

    // 1. Add current timestamp to sorted set
    pipeline.zadd(key, timestamp, timestamp.toString());

    // 2. Remove entries older than window start
    pipeline.zremrangebyscore(key, 0, windowStart);

    // 3. Get remaining count
    pipeline.zcard(key);

    // 4. Auto-expiry key slightly after window
    pipeline.expire(key, WINDOW_SIZE_SECONDS+5);

    const results = await pipeline.exec();

    const failureCounts = results[2][1];

    if(failureCounts > FAILURE_THRESHOLD) {
        return {
            anomaly: true,
            count: failureCounts,
            msg: `Sliding-window burst login failures detected for IP ${ip}`
        };
    }

    return { anomaly: true }
}
