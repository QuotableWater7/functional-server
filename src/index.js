const http = require('http')
const PORT = 3002

const compose = (...fns) => fns.reduce((composed, fn) => (...args) => composed(fn(...args)))

async function getBlah(req, res) {
	res.write('Serving blah')
	res.end()
}

async function getIndex(req, res) {
	res.write('Index page')
	res.end()
}

const routes = [
	{
		url: '/blah',
		method: 'GET',
		handler: getBlah,
	},
	{
		url: '/',
		method: 'GET',
		handler: getIndex,
	},
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

const server = compose(
	createServer,
	createRouter,
	indexRoutes
)(routes)

server.listen(PORT, function listening() {
	console.log(`Server now listening on port ${PORT}`)
})
