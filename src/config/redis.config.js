import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6394";

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  lazyConnect: false,
});

redis.on("connect", () => {
  console.log("Redis connected successfully 🚀");
});

redis.on("ready", () => {
  console.log("Redis client ready to process operations");
});

redis.on("error", (err) => {
  console.error("Redis connection error ❌:", err.message);
});

redis.on("reconnecting", (time) => {
  console.log(`Redis reconnecting in ${time}ms... 🔄`);
});

export default redis;
