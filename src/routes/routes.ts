import * as Router from 'koa-router'
import * as body from 'koa-bodyparser'
import { User } from '../user'
import { Token } from '../token'

const router = new Router()

router.post('/', body(), async (ctx) => {
  ctx.status = 401

  const isAuthorized = await User.isAuthorized(ctx.request.body)

  if (isAuthorized) {
    const tokens = await Token.generatePair(ctx.request.body.username)
    ctx.status = 200
    ctx.body = tokens
  }
})

router.get('/', async (ctx) => {
  ctx.status = 401

  const { authorization } = ctx.headers

  if (!authorization || !authorization.match(/^Bearer\s/)) {
    return null
  }

  const refreshToken = authorization.replace(/^Bearer\s/, '')
  const { username } = await Token.getPayload(refreshToken)

  const hasValidRefreshToken = await User.hasValidRefreshToken(refreshToken)

  if (hasValidRefreshToken) {
    const tokens = await Token.generatePair(username)

    ctx.status = 200
    ctx.body = tokens
  }
})

router.post('/register', body(), async (ctx) => {
  ctx.status = 401

  const { error, value } = await User.register(ctx.request.body)

  if (error) {
    ctx.body = {
      error,
    }
    return null
  }
  const tokens = await Token.generatePair(ctx.request.body.username)
  ctx.status = 200
  ctx.body = tokens
})

export {
  router
}
