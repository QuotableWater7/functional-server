# Functional Server Example

## Installation

NOTE: This package is not actually on npm yet due to some publishing issues, but will be soon.
```bash
npm install --save fp-serv

# or

yarn add fp-serv
```

## Getting Started
Getting a server up and running is as simple as:

```js
const { createServer } = require('fp-serv')

createServer()
```

You should see a message in the console
`Server now listening on port 3000`

### createServer arguments
`createServer` takes in `port`, `middlewares`, and `routes`, all of which are optional parameters.  Below is an example of a very simple server where the output of each request just reveals details about the route and query parameters:

```js
const {
	createServer,
	route,
} = require('fp-serv')

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
	route.get({
		path: '/',
		handler: handler,
	}),

	route.get({
		path: '/tests/:testId/subItem/:subItemId',
		handler: handler,
	}),

	route.applyNamespace('/api')([
		route.get({
			path: '/blah',
			handler: handler,
		}),

		route.post({
			path: '/blah',
			handler: handler,
		}),

		route.applyNamespace('/v2')([
			route.get({
				path: '/blah',
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
```
