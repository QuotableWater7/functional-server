const {
	createServer,
	createGetRoute,
	createPostRoute,
} = require('../src')

async function getBlah(req, res) {
	res.write('GET blah')
	res.end()
}

async function getIndex(req, res) {
	res.write('Index page')
	res.end()
}

async function postBlah(req, res) {
	res.write('POST blah')
	res.end()
}

const routes = [
	createGetRoute({
		url: '/',
		handler: getIndex,
	}),
	createGetRoute({
		url: '/blah',
		handler: getBlah,
	}),
	createPostRoute({
		url: '/blah',
		handler: postBlah,
	}),
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