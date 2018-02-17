import * as Joi from 'joi'
import * as bcrypt from 'bcrypt'
import * as env from 'dotenv';
import { schema } from './schema'
import { redisClient } from '../redis-client';
import { Token } from '../token';


env.config()

interface Body {
  username: string,
  password: string,
}

const {
  SALT,
} = process.env

const isAuthorized = async (body: Body) => {
  const { error, value } = Joi.validate(body, schema)

  if (error) {
    return false
  }

  const providedPassword = value.password
  const correctPassword = await redisClient.getAsync(value.username)

  const isTrue = await bcrypt.compare(providedPassword, correctPassword)

  return isTrue
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

  const passwordHash = await bcrypt.hash(password, parseInt(SALT, 10))

  await redisClient.setAsync(username, passwordHash)

  return {
    value: {
      username,
      password: passwordHash,
    },
  }
}

export const User = {
  isAuthorized,
  hasValidRefreshToken,
  register,
}
