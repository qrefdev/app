RpcRoute = require('../../../RpcRoute')
RpcResponse = require('../../../../serialization/RpcResponse')
UserAuth = require('../../../../security/UserAuth')
class LoginRoute extends RpcRoute
	constructor: () ->
		super [{ method: 'POST', path: '/login' }, { method: 'GET', path: '/login' }]
	post: (req, res) =>
		if not @.isValidRequest(req)
			resp = new RpcResponse(null)
			resp.failure('Bad Request', 400)
			res.json(resp, 200)
			return
			
		UserAuth.login(req.body.userName, req.body.password, (err, token, success) ->
			resp = null
			if err? 
				resp = new RpcResponse(null)
				resp.failure(err, 500)
				res.json(resp, 200)
			else if not success
				resp = new RpcResponse(null)
				resp.failure('Forbidden', 403)
				res.json(resp, 200)
			else 
				resp = new RpcResponse(token) 
				res.json(resp, 200)
		)
	isValidRequest: (req) ->
		if req.body? and req.body?.mode? and req.body.mode == 'rpc' and req.body?.userName? and req.body?.password?
			true
		else
			false 
	
module.exports = new LoginRoute()