class Route
	methods: [{method: 'GET', path: null }, {method: 'POST', path: null}, {method: 'PUT', path: null}, {method: 'DELETE', path: null}]
	constructor: (methods) -> 
		@methods = methods if methods?
	getMethods: () -> @methods
	post: (req, res) ->
	get: (req, res) ->
	put: (req, res) ->
	del: (req, res) ->
	
module.exports = Route
