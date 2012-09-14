###
Basic definition of a route that supports GET, POST, PUT, and DELETE HTTP verbs. 
@author Nathan Klick
@copyright QRef 2012
@abstract
###
class Route
	###
	@property [Array<RouteMethod>] The array of HTTP methods to register with the express runtime. 
	###
	methods: [{method: 'GET', path: null }, {method: 'POST', path: null}, {method: 'PUT', path: null}, {method: 'DELETE', path: null}]
	###
	Create a new Route object instance and registers the given methods with the router.
	@param methods [Array<RouteMethod>] The methods to register with the router.
	###
	constructor: (methods) -> 
		@methods = methods if methods?
	###
	Accessor for the list of methods to be registered with the router.
	@return [Array<RouteMethod>] The array of {RouteMethod} objects.
	###
	getMethods: () -> @methods
	###
	Invoked when a POST request is received by the express runtime on the registered URL.
	@param req [Express.Request] The express request object.
	@param res [Express.Response] The express response object.
	###
	post: (req, res) ->
	###
	Invoked when a GET request is received by the express runtime on the registered URL.
	@param req [Express.Request] The express request object.
	@param res [Express.Response] The express response object.
	###
	get: (req, res) ->
	###
	Invoked when a PUT request is received by the express runtime on the registered URL.
	@param req [Express.Request] The express request object.
	@param res [Express.Response] The express response object.
	###
	put: (req, res) ->
	###
	Invoked when a DELETE request is received by the express runtime on the registered URL.
	@param req [Express.Request] The express request object.
	@param res [Express.Response] The express response object.
	###
	del: (req, res) ->
	
module.exports = Route
