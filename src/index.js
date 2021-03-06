const http = require('http')

const compose = require('./lib/general/compose')
const route = require('./lib/route')

const PORT = 3000

const flattenRoutes = ([...mixedArray]) => mixedArray.reduce(
	(output, item) => {
		return item instanceof Array ?
			output.concat(...flattenRoutes(item)) :
			output.concat([item])
	},
	[]
)

const extractIdNames = url => url.match(/:(\w+)/g) || []

const addRouteRegex = routes => routes.map(route => {
	return Object.assign({}, route, {
		regex: new RegExp(
			`^${route.path.split('?')[0].replace(/:\w+/g, '(\\w+)')}(?:\\?.*)?$`
		),
		idNames: extractIdNames(route.path),
	})
})

const extractQueryParams = path => {
	const queryString = path.split('?')[1] || ''

	return queryString.split('&').reduce((query, chunk) => {
		const [key, value] = chunk.split('=')
		return Object.assign({}, query, { [key]: value })
	}, {})
}

const extractIdsFromUrl = ({ url, route }) => {
	const matches = route.regex.exec(url).slice(1)
	const idNames = route.idNames


	return idNames.reduce(
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
		res.statusCode = 404
		res.write(`404: Cannot serve ${method} to ${url}`)
		res.end()
		return
	}

	const decoratedRequest = Object.assign({}, req, {
		query: extractQueryParams(url),
		params: extractIdsFromUrl({ route, url }),
	})

	route.handler(decoratedRequest, res)
}

const createRouter = compose(createRequestHandler, addRouteRegex)

const addMiddlewares = (...middlewares) => router => (req, res) => {
	// each middleware gets a reference to the "next" middleware in the chain
	// with the final reference being the function that executes the request via the router.
	// middlewares are executed from last to first, similar to lodash.flowRight
	const bindArgsToMiddleware = (next, middleware) => (() => middleware(req, res, next))

	return middlewares.reduce(
		bindArgsToMiddleware,
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

	server.listen(port, () => {
		console.log(`Server now listening on port ${port}`)
	})
}

module.exports = {
	route,
	createServer,
}
