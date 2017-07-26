const http = require('http')

const createGetRoute = require('./lib/create-get-route')
const createPostRoute = require('./lib/create-post-route')
const compose = require('./lib/general/compose')

const PORT = 3000

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

const createRequestHandler = indexedRoutes => (req, res) => {
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

const createRouter = compose(createRequestHandler, indexRoutes)

const addMiddlewares = (...middlewares) => router => (req, res) => middlewares.reduce(
	(next, middleware) => () => middleware(req, res, next),
	() => router(req, res)
)()

function createServer({ port = PORT, middlewares = [], routes = [] }) {
	const server = compose(
		router => http.createServer(router),
		addMiddlewares(...middlewares),
		createRouter,
	)(routes)

	server.listen(port, function listening() {
		console.log(`Server now listening on port ${port}`)
	})
}

module.exports = {
	addMiddlewares,
	createGetRoute,
	createPostRoute,
	createServer,
}
