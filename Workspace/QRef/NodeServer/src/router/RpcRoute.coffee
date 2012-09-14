Route = require('./Route')
RpcResponse = require('../serialization/RpcResponse')
### 
A route which only supports RPC operations (HTTP POST).
@author Nathan Klick
@copyright QRef 2012
###
class RpcRoute extends Route
	###
	Create a new Route object instance and registers the given methods with the router.
	@param methods [Array<RouteMethod>] The methods to register with the router.
	###
	constructor: (methods) ->
		super methods
	###
	Invoked when a GET request is received by the express runtime on the registered URL.
	@param req [Express.Request] The express request object.
	@param res [Express.Response] The express response object.
	###
	get: (req, res) ->
		resp = new RpcResponse(null)
		resp.failure('Method Not Allowed', 405)
		res.json(resp, 200)
	###
	Invoked when a PUT request is received by the express runtime on the registered URL.
	@param req [Express.Request] The express request object.
	@param res [Express.Response] The express response object.
	###
	put: (req, res) ->
		resp = new RpcResponse(null)
		resp.failure('Method Not Allowed', 405)
		res.json(resp, 200)
	###
	Invoked when a DELETE request is received by the express runtime on the registered URL.
	@param req [Express.Request] The express request object.
	@param res [Express.Response] The express response object.
	###
	del: (req, res) ->
		resp = new RpcResponse(null)
		resp.failure('Method Not Allowed', 405)
		res.json(resp, 200)
module.exports = RpcRoute