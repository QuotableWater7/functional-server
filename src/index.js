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

const addRouteRegex = routes => routes.map(route => {
	return Object.assign({}, route, {
		regex: new RegExp(
			`^${route.url.split('?')[0].replace(/:\w+/g, '(\\w+)')}(?:\\?.*)?$`
		)
	})
})

const extractQueryParams = url => {
	const queryString = url.split('?')[1]

	if (!queryString) {
		return {}
	}

	return queryString.split('&').reduce((query, chunk) => {
		const [key, value] = chunk.split('=')
		return Object.assign({}, query, { [key]: value })
	}, {})
}

const extractIds = ({ url, route }) => {
	const matches = route.regex.exec(url).slice(1)
	const idNames = /:(\w+)/g.exec(route.url)

	if (!idNames) {
		return {}
	}

	return idNames.slice(1).reduce(
		(output, idName) => {
			return Object.assign({}, output, {
				idMap: Object.assign({}, output.idMap, {
					[idName]: matches[output.matchIndex],
				}),
				matchIndex: ++output.matchIndex,
			})
		},
		{
			matchIndex: 0,
			idMap: {},
		}
	).idMap
}

const createRequestHandler = routes => (req, res) => {
	const url = req.url
	const method = req.method

	const route = routes.find(r => r.regex.test(url) && r.method === method)

	if (!route) {
		res.write(`404: Cannot serve ${method} to ${url}`)
		res.end()
		return
	}

	req.query = extractQueryParams(url)
	req.params = extractIds({ route, url })

	route.handler(req, res)
}

const createRouter = compose(createRequestHandler, addRouteRegex)

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

const applyNamespace = namespace => routes => {
	return routes.map(route => {
		if (route instanceof Array) {
			return applyNamespace(namespace)(route)
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
