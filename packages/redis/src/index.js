import redis from 'redis';
import "dotenv/config";
const client = redis.createClient({
    url: process.env.REDIS_URL,
});
export default client;
//# sourceMappingURL=index.js.map