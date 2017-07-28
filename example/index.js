const {
	createServer,
	createGetRoute,
	createPostRoute,
	applyNamespace,
} = require('../src')

async function handler(req, res) {
	const hasQuery = Object.keys(req.query).length > 0
	const hasParams = Object.keys(req.params).length > 0

	res.write([
		`method: ${req.method}`,
		`path: ${req.url.split('?')[0]}`,
		hasParams ? `params: ${JSON.stringify(req.params)}` : '',
		hasQuery ? `query: ${JSON.stringify(req.query)}` : '',
	].join('\n'))
	res.end()
}

const routes = [
	createGetRoute({
		url: '/',
		handler: handler,
	}),

	createGetRoute({
		url: '/tests/:testId/subItem/:subItemId',
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

				console.log(`${route} ${res.statusCode} (${d2 - d1}ms)`)
			})

			next()
		},
	],
	routes,
})
