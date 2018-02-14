import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as morgan from 'koa-morgan'
import * as env from 'dotenv'
import * as helmet from 'koa-helmet'
import { promisifyAll } from 'bluebird'
import { router } from './routes'


env.config()

const {
  PORT,
} = process.env

const server = new Koa()

server
  .use(helmet())
  .use(morgan('dev'))
  .use(router.routes())
  .listen(PORT, () => {
    console.log(`listening on ${PORT}`)
  })
