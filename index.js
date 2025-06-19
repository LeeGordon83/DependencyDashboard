import dotenv from 'dotenv'
import { EventEmitter } from 'events'

import Hapi from '@hapi/hapi'
import Vision from '@hapi/vision'
import Inert from '@hapi/inert'
import Path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import Nunjucks from 'nunjucks'

import DashboardRoutes from './routes/dashboard.js'
import HomeRoutes from './routes/home.js'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config()
EventEmitter.defaultMaxListeners = 20

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  })

  await server.register([
    Vision,
    Inert,
    DashboardRoutes,
    HomeRoutes
  ])

  server.route({
    method: 'GET',
    path: '/public/{param*}',
    handler: {
      directory: {
        path: Path.join(__dirname, 'public'),
        listing: false
      }
    }
  })

  server.views({
    engines: {
      njk: {
        compile: (src, options) => {
          const template = Nunjucks.compile(src, options.environment)
          return (context) => template.render(context)
        },
        prepare: (options, next) => {
          options.compileOptions.environment = Nunjucks.configure(options.path, { watch: false })
          next()
        }
      }
    },
    path: Path.join(__dirname, 'views'),
    isCached: false,
    relativeTo: __dirname
  })

  await server.start()
  console.log(`🚀 Server running at: ${server.info.uri}`)
}

process.on('unhandledRejection', (err) => {
  console.error(err)
  process.exit(1)
})

init()
