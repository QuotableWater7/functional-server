const createRoute = require('../create-route')
const compose = require('../general/compose')

const assignMethodToGET = route => Object.assign({}, route, { method: 'GET' })

module.exports = compose(createRoute, assignMethodToGET)
