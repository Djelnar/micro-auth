import * as Redis from 'redis'
import * as env from 'dotenv'
import { promisifyAll } from 'bluebird'


env.config()

promisifyAll(Redis.RedisClient.prototype)
promisifyAll(Redis.Multi.prototype)

declare module 'redis' {
  export interface RedisClient extends NodeJS.EventEmitter {
    setAsync(key: string, value: string): Promise<string>;
    getAsync(key: string): Promise<string>;
  }
}

const {
  REDIS_HOST,
  REDIS_PORT,
} = process.env

export const redisClient = Redis.createClient({
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT, 10),
})
