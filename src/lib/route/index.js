const compose = require('../general/compose')

const validMethods = new Set(['GET', 'POST', 'PATCH', 'PUT', 'DELETE'])

// eventually, rely on Flow or typescript?
const validateMethod = method => {
	if (!validMethods.has(method)) {
		throw new Error(`"${method}" is not a valid HTTP method`)
	}
}

const validateHandler = handler => {
	if (typeof handler !== 'function') {
		throw new Error('Handler must be a function')
	}
}

function createRoute({ path, method, handler }) {
	validateMethod(method)
	validateHandler(handler)

	return {
		path,
		method,
		handler,
	}
}

const assignMethodTo = method => route => Object.assign({}, route, { method })

const applyNamespace = namespace => routes => {
	return routes.map(route => {
		if (route instanceof Array) {
			return applyNamespace(namespace)(route)
		}

		return Object.assign({}, route, { path: `${namespace}${route.path}` })
	})
}

module.exports = {
	get: compose(createRoute, assignMethodTo('GET')),
	post: compose(createRoute, assignMethodTo('POST')),
	put: compose(createRoute, assignMethodTo('PUT')),
	patch: compose(createRoute, assignMethodTo('PATCH')),
	delete: compose(createRoute, assignMethodTo('DELETE')),
	applyNamespace,
}
