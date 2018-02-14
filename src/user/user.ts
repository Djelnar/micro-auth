import * as Joi from 'joi'
import { schema } from './schema'
import { redisClient } from '../redis-client';
import { Token } from '../token';
import * as Koa from 'koa'



interface Body {
  username: string,
  password: string,
}

const isAuthorized = async (body: Body) => {
  const { error, value } = Joi.validate(body, schema)

  if (error) {
    return false
  }

  const providedPassword = value.password
  const correctPassword = await redisClient.getAsync(value.username)

  return providedPassword === correctPassword
}

const hasValidRefreshToken = async (token: string) => {
  const { username } = await Token.getPayload(token)
  const correctRefreshToken = await redisClient.getAsync(`${username}_refresh_token`)

  return correctRefreshToken === token
}

const register = async (body: Body) => {
  const { error, value } = Joi.validate(body, schema)

  if (error) {
    return {
      error,
    }
  }

  const { username, password } = value

  const checkPassword = await redisClient.getAsync(username)

  if (checkPassword) {
    return {
      error: 'already exists',
    }
  }

  await redisClient.setAsync(username, password)

  return {
    value,
  }
}

export const User = {
  isAuthorized,
  hasValidRefreshToken,
  register,
}
