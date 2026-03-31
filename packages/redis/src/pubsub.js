import redisClient from "./index.js";
export const publisher = redisClient.duplicate();
export const subscriber = redisClient.duplicate();
//# sourceMappingURL=pubsub.js.map