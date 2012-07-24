Route = require('./Route')
RpcResponse = require('../serialization/RpcResponse')
class RpcRoute extends Route
	constructor: (methods) ->
		super methods
	get: (req, res) ->
		resp = new RpcResponse(null)
		resp.failure('Method Not Allowed', 405)
		res.json(resp, 200)
	put: (req, res) ->
		resp = new RpcResponse(null)
		resp.failure('Method Not Allowed', 405)
		res.json(resp, 200)
	del: (req, res) ->
		resp = new RpcResponse(null)
		resp.failure('Method Not Allowed', 405)
		res.json(resp, 200)
module.exports = RpcRoute