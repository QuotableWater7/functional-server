const compose = (...fns) => fns.reduce((composed, fn) => (...args) => composed(fn(...args)))

module.exports = compose
