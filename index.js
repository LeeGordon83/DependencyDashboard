require('dotenv').config()
const Hapi = require('@hapi/hapi')
const Vision = require('@hapi/vision')
const Inert = require('@hapi/inert')
const Path = require('path')
const Nunjucks = require('nunjucks')
const DashboardRoutes = require('./routes/dashboard')

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  })

  await server.register([
    Vision,
    Inert,
    DashboardRoutes
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
