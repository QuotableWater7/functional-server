const http = require('http')

const createGetRoute = require('./lib/create-get-route')
const createPostRoute = require('./lib/create-post-route')
const compose = require('./lib/general/compose')

const PORT = 3000

const flattenRoutes = ([...mixedArray]) => mixedArray.reduce(
	(output, item) => {
		return item instanceof Array ?
			output.concat(...flattenRoutes(item)) :
			output.concat([item])
	},
	[]
)

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

const addMiddlewares = (...middlewares) => router => (req, res) => {
	// each middleware gets a reference to the "next" middleware in the chain
	// with the final reference being the function that executes the request via the router.
	// middlewares are executed from last to first, similar to lodash.flowRight
	return middlewares.reduce(
		function bindArgsToMiddleware(next, middleware) {
			return () => middleware(req, res, next)
		},
		() => router(req, res)
	)()
}

function createServer({
	port = PORT,
	middlewares = [],
	routes = [],
}) {
	const server = compose(
		router => http.createServer(router),
		addMiddlewares(...middlewares),
		createRouter,
		flattenRoutes,
	)(routes)

	server.listen(port, function listening() {
		console.log(`Server now listening on port ${port}`)
	})
}

const applyNamespace = namespace => (...routes) => {
	return routes.map(route => {
		if (route instanceof Array) {
			return applyNamespace(namespace)(...route)
		}

		return Object.assign({}, route, { url: `${namespace}${route.url}` })
	})
}

module.exports = {
	addMiddlewares,
	createGetRoute,
	createPostRoute,
	createServer,
	applyNamespace,
}
