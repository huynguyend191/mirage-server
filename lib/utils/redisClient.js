const redis = require('async-redis');
const redisClient = redis.createClient();

module.exports = redisClient;