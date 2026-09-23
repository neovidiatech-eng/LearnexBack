import redis from "../config/redis.config.js";

/**
 * Get value by key from Redis (automatically parses JSON if possible)
 * @param {string} key
 * @returns {Promise<any>}
 */
export const getCache = async ({key}) => {
  try {
    const data = await redis.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  } catch (error) {
    console.error(`Error getting key "${key}" from Redis:`, error.message);
    return null;
  }
};

/**
 * Set value by key in Redis with optional TTL in seconds
 * @param {string} key
 * @param {any} value
 * @param {number|null} ttlInSeconds
 * @returns {Promise<boolean>}
 */
export const setCache = async ({key, value, ttlInSeconds = null}) => {
  //console.log({key, value, ttlInSeconds });
  
  try {
    const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);
    if (ttlInSeconds) {
    const res =  await redis.set(key, stringValue, "EX", ttlInSeconds);
    //console.log(res);
    
    } else {
     const res =  await redis.set(key, stringValue);
  //   console.log(res);
    }
    return true;
  } catch (error) {
    console.error(`Error setting key "${key}" in Redis:`, error.message);
    return false;
  }
};

/**
 * Delete key or array of keys from Redis
 * @param {string|string[]} keys
 * @returns {Promise<boolean>}
 */
export const deleteCache = async (keys) => {
  try {
    if (Array.isArray(keys)) {
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } else {
      await redis.del(keys);
    }
    return true;
  } catch (error) {
    console.error(`Error deleting key(s) "${keys}" from Redis:`, error.message);
    return false;
  }
};

/**
 * Check if a key exists in Redis
 * @param {string} key
 * @returns {Promise<boolean>}
 */
export const existsCache = async (key) => {
  try {
    const result = await redis.exists(key);
    return result === 1;
  } catch (error) {
    console.error(`Error checking key "${key}" in Redis:`, error.message);
    return false;
  }
};

export default {
  client: redis,
  getCache,
  setCache,
  deleteCache,
  existsCache,
};
