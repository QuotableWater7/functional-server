const {
	createServer,
	createGetRoute,
	createPostRoute,
	applyNamespace,
} = require('../src')

async function getIndex(req, res) {
	res.write('Index page')
	res.end()
}

async function getBlah(req, res) {
	res.write('GET blah')
	res.end()
}

async function getBlahV2(req, res) {
	res.write('GET blah v2')
	res.end()
}

async function postBlah(req, res) {
	res.write('POST blah')
	res.end()
}

async function getTest(req, res) {
	res.write('GET test')
	res.end()
}

const routes = [
	createGetRoute({
		url: '/',
		handler: getIndex,
	}),

	createGetRoute({
		url: '/test/:idOfSomeSort',
		handler: getTest,
	}),

	applyNamespace('/api')([
		createGetRoute({
			url: '/blah',
			handler: getBlah,
		}),

		createPostRoute({
			url: '/blah',
			handler: postBlah,
		}),

		applyNamespace('/v2')([
			createGetRoute({
				url: '/blah',
				handler: getBlahV2,
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
