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

module.exports = function createRoute({ path, method, handler }) {
	validateMethod(method)
	validateHandler(handler)

	return {
		path,
		method,
		handler,
	}
}
