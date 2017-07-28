const {
	createServer,
	createGetRoute,
	createPostRoute,
	applyNamespace,
} = require('../src')

async function handler(req, res) {
	const hasQuery = Object.keys(req.query).length > 0

	res.write(`${req.method} ${req.url.split('?')[0]} ${hasQuery ? JSON.stringify(req.query) : ''}`)
	res.end()
}

const routes = [
	createGetRoute({
		url: '/',
		handler: handler,
	}),

	createGetRoute({
		url: '/test/:idOfSomeSort',
		handler: handler,
	}),

	applyNamespace('/api')([
		createGetRoute({
			url: '/blah',
			handler: handler,
		}),

		createPostRoute({
			url: '/blah',
			handler: handler,
		}),

		applyNamespace('/v2')([
			createGetRoute({
				url: '/blah',
				handler: handler,
			}),
		]),
	]),
]

createServer({
	port: 3002,
	middlewares: [
		function logRequestTimes(req, res, next) {
			if (req.url === '/favicon.ico') {
				return next()
			}

			const d1 = new Date()

			req.on('end', () => {
				const d2 = new Date()
				const route = `${req.method} ${req.url}`
				console.log(`${route} (${d2 - d1}ms)`)
			})

			next()
		},
	],
	routes,
})
