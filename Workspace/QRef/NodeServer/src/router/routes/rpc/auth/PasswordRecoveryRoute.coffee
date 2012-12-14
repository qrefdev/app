RpcRoute = require('../../../RpcRoute')
RpcResponse = require('../../../../serialization/RpcResponse')
UserAuth = require('../../../../security/UserAuth')
FileSystem = require('fs')
Mailer = require(mailer)
###
Service route that is used to create a new user account.
Password Recovery!
###
class PasswordRecoveryRoute extends RpcRoute
	constructor: () ->
		super [{ method: 'POST', path: '/passwordRecovery' }]
	post: (req, res) =>
		if not @.isValidRequest(req)
			resp = new RpcResponse(null)
			resp.failure('Bad Request', 400)
			res.json(resp, 200)
			return	
			
		UserAuth.applyPasswordRecovery(req.body.token, (err, user, password) ->
			if err?
				resp = new RpcResponse(null)
				resp.failure('Bad Request', 400)
				res.json(resp, 200)
				return
				
			if user? and password?
				resp = new RpcResponse(null)
				res.json(resp, 200)
				
				@.getEmailTemplate('passwordReset.html', (data) ->
					if data?
						data.replace('{password}', password)
					
						Mailer.send({
							host: '10.1.224.10',
							port: '25',
							to: user.userName,
							from: 'admin@qref.com',
							subject: 'QRef Mobile - Password Reset',
							body: data
						}, (err, result) ->
							
						)
				)
				
				return

			resp = new RpcResponse(null)
			resp.failure('Failed to generate new password', 400)
			res.json(resp, 200)
			return
		)
	
	getEmailTemplate: (file, callback) ->
		FileSystem.readFile('../../../../../../WebContent/email/' + file, 'utf8', (err, data) ->
			if err?
				callback(null);
				return
			
			if data?
				callback(data);
				return
		)
		
	isValidRequest: (req) ->
		if req.body? and req.body?.mode? and req.body.mode == 'rpc' and req.body?.token?
			true
		else
			false 
	
module.exports = new PasswordRecoveryRoute()