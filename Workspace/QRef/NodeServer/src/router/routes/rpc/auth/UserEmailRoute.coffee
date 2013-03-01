RpcRoute = require('../../../RpcRoute')
RpcResponse = require('../../../../serialization/RpcResponse')
UserAuth = require('../../../../security/UserAuth')
QRefDatabase = require('../../../../db/QRefDatabase')
async = require('async')
###
Service route that retrieves role membership.
@example Service Methods (see {UserRolesRpcRequest})
  Request Format: application/json
  Response Format: application/json
  
  POST /services/rpc/auth/userRoles
    @BODY - (Required) UserRolesRpcRequest
    
  Retrieves the roles assigned to a given user or the owner of the token. 
@author Nathan Klick
@copyright QRef 2012
###
class UserEmailRoute extends RpcRoute
	constructor: () ->
		super [{ method: 'POST', path: '/userEmail' }, { method: 'GET', path: '/userEmail' }]
	post: (req, res) =>
		if not @.isValidRequest(req)
			resp = new RpcResponse(null)
			resp.failure('Bad Request', 400)
			res.json(resp, 200)
			return
			
		token = req.body.token 
			
		UserAuth.userFromToken(token, (err, user) =>
			if err? or not user?
				resp = new RpcResponse(null)
				resp.failure('Forbidden', 403)
				res.json(resp, 200)
				return
				
			resp = new RpcResponse(user.userName)
			res.json(resp, 200)
			return
		)
		
	isValidRequest: (req) ->
		if req.body? and req.body?.mode? and req.body.mode == 'rpc' and req.body?.token?
			true
		else
			false 
	
module.exports = new UserEmailRoute()