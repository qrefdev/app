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
class UserRolesRoute extends RpcRoute
	constructor: () ->
		super [{ method: 'POST', path: '/userRoles' }, { method: 'GET', path: '/userRoles' }]
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
			
			userId = null
			if req.body?.user?
				userId = req.body.user
			else
				userId = user._id
			
			@.getUserRoles(userId, (err, roles) ->
				if err?
					resp = new RpcResponse(null)
					resp.failure(err, 500)
					res.json(resp, 200)
					return
				
				resp = new RpcResponse(roles)
				res.json(resp, 200)
				return
			)
				
			
		)
	getUserRoles: (userId, callback) =>
		db = QRefDatabase.instance()
		
		db.User.findById(userId, (err, user) ->
			if err?
				callback(err, [])
				return
			
			if not user?
				callback(new Error("User was not found."), [])
				return
				
			roleNames = []
				
			async.forEach(user.roles, (item, cb) ->
					db.Role.findById(item, (err, role) ->
						if err?
							cb(err)
							return
						
						if not role?
							cb(null)
							return
							
						roleNames.push(role.roleName)
						cb(null)
					)
				, (err) ->
					if err?
						callback(err, [])
						return
						
					callback(null, roleNames)					
			)
		)
		
	isValidRequest: (req) ->
		if req.body? and req.body?.mode? and req.body.mode == 'rpc' and req.body?.token?
			true
		else
			false 
	
module.exports = new UserRolesRoute()