import { RedisClientType } from 'redis';
import "dotenv/config";
declare const client: RedisClientType;
export default client;
export type TypeOfRedisClient = RedisClientType;
