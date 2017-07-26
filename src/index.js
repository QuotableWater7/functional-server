const http = require('http')

const createGetRoute = require('./lib/create-get-route')
const createPostRoute = require('./lib/create-post-route')
const compose = require('./lib/general/compose')

const PORT = 3002

async function getBlah(req, res) {
	res.write('Serving blah')
	res.end()
}

async function getIndex(req, res) {
	res.write('Index page')
	res.end()
}

async function postBlah(req, res) {
	res.write('JSON woo')
	res.end()
}

const routes = [
	createGetRoute({
		url: '/blah',
		handler: getBlah,
	}),
	createGetRoute({
		url: '/',
		handler: getIndex,
	}),
	createPostRoute({
		url: '/blah',
		handler: postBlah,
	})
]

const indexRoutes = routes => routes.reduce(
	(routerIndex, route) => Object.assign(
		{},
		routerIndex,
		{
			[`${route.method}::${route.url}`]: route,
		}
	),
	{}
)

const createRouter = indexedRoutes => (req, res) => {
	const url = req.url
	const method = req.method

	const route = indexedRoutes[`${method}::${url}`]

	if (!route) {
		res.write(`404: Cannot serve ${method} to ${url}`)
		res.end()
		return
	}

	route.handler(req, res)
}

const createServer = router => http.createServer(router)

const addMiddlewares = (...middlewares) => router => (req, res) => middlewares.reduce(
	(next, middleware) => () => middleware(req, res, next),
	() => router(req, res)
)()

const server = compose(
	createServer,
	addMiddlewares(
		function logRequestTimes(req, res, next) {
			if (req.url === '/favicon.ico') {
				return next()
			}

			const d1 = new Date()
			next()
			const d2 = new Date()

			const route = `${req.method} ${req.url}`

			console.log(`${route} (${d2 - d1}ms)`)
		}
	),
	createRouter,
	indexRoutes
)(routes)

server.listen(PORT, function listening() {
	console.log(`Server now listening on port ${PORT}`)
})
