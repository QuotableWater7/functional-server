const createRoute = require('../create-route')
const compose = require('../general/compose')

const assignMethodToPOST = route => Object.assign({}, route, { method: 'POST' })

module.exports = compose(createRoute, assignMethodToPOST)
