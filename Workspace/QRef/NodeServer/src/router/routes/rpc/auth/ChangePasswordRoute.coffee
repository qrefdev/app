RpcRoute = require('../../../RpcRoute')
RpcResponse = require('../../../../serialization/RpcResponse')
UserAuth = require('../../../../security/UserAuth')
Mailer = require('mailer')
###
Change password!
@copyright QRef 2012
###
class ChangePasswordRoute extends RpcRoute
	constructor: () ->
		super [{ method: 'POST', path: '/changePassword' }]
	post: (req, res) =>
		if not @.isValidRequest(req)
			resp = new RpcResponse(null)
			resp.failure('Bad Request', 400)
			res.json(resp, 200)
			return
			
		UserAuth.changePassword(req.body.token, req.body.oldPassword, req.body.newPassword, (err, user, status) =>
			if err?
				resp = new RpcResponse(err)
				resp.failure('Bad Request', 400)
				res.json(resp, 200)
				return
				
			if user?

				if status == 3
					resp = new RpcResponse(null)
					resp.failure('Failed to change password. Incorrect password!', 400)
					res.json(resp, 200)
					return

				if status == 2
					resp = new RpcResponse(null)
					resp.failure('Failed to change password. Current password and new password are the same!', 400)
					res.json(resp, 200)
					return
				
				if status == 1
					resp = new RpcResponse(null)
					res.json(resp, 200)
					
					@.getEmailTemplate('passwordChanged.html', (data) ->
						if data?						
							Mailer.send({
								host: '10.1.224.10',
								port: '25',
								to: user.userName,
								from: 'admin@qref.com',
								subject: 'QRef Mobile - Password Changed',
								body: data
							}, (err, result) ->
								
							)
					)
					
					return
			
				resp = new RpcResponse(null)
				resp.failure('Failed to change password', 400)
				res.json(resp, 200)
				return
			
			resp = new RpcResponse(null)
			resp.failure('Bad Request', 400)
			res.json(resp, 200)
			return
		)
		
		resp = new RpcResponse(null)
		resp.failure('Bad Request', 400)
		res.json(resp, 200)
		return
	
	getEmailTemplate: (file, callback) ->
		FileSystem.readFile('../WebContent/email/' + file, 'utf8', (err, data) ->
			if err?
				callback(null);
				return
			
			if data?
				callback(data);
				return
		)	
		
	isValidRequest: (req) ->
		if req.body? and req.body?.mode? and req.body.mode == 'rpc' and req.body?.oldPassword? and req.body?.newPassword? and req.body?.token?
			true
		else
			false 
	
module.exports = new ChangePasswordRoute()