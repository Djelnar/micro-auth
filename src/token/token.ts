import * as jwt from 'jsonwebtoken'
import { promisifyAll } from 'bluebird'
import * as env from 'dotenv'
import { redisClient } from '../redis-client'
console.log(redisClient.setAsync)


env.config()
promisifyAll(jwt)

export interface Payload {
  username: string
}

export interface Decoded {
  exp: number,
}

declare module 'jsonwebtoken' {
  export function verifyAsync(token: string, key: string): Promise<Payload>
  export function decode(token: string): Promise<Decoded>
}

const {
  KEY,
} = process.env

const generatePair = async (username: string) => {
  const accessToken = jwt.sign({ username }, KEY, {
    expiresIn: '10m'
  })
  const refreshToken = jwt.sign({ username }, KEY, {
    expiresIn: '30d'
  })
  const { exp } = await jwt.decode(accessToken)

  const tokens = {
    accessToken,
    refreshToken,
    expiresIn: exp,
  }

  const a = await redisClient.setAsync(`${username}_access_token`, accessToken)
  const b = await redisClient.setAsync(`${username}_refresh_token`, refreshToken)

  return tokens
}

const getPayload = async (token: string) => {
  try {
    const payload = await jwt.verifyAsync(token, KEY)

    return payload
  } catch (error) {
    console.log('Cannot verify token:', token)
  }
  return {
    username: ''
  }
}

export const Token = {
  generatePair,
  getPayload,
}
