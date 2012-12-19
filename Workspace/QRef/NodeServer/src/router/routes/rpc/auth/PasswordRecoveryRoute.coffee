RpcRoute = require('../../../RpcRoute')
RpcResponse = require('../../../../serialization/RpcResponse')
UserAuth = require('../../../../security/UserAuth')
fs = require('fs')
Mailer = require('nodemailer')
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
			
		UserAuth.applyPasswordRecovery(req.body.token, (err, user, password) =>
			if err?
				resp = new RpcResponse(null)
				resp.failure('Internal Error', 500)
				res.json(resp, 200)
				return
				
			if user? and password?
				resp = new RpcResponse(null)
				res.json(resp, 200)
				
				@.getEmailTemplate('passwordReset.html', (data) ->
					if data?
						console.log(data)
						data = data.replace(/\{password\}/g, password)
					
						transport = Mailer.createTransport("SMTP", {
							host: '10.1.224.10',
							port: 25,
						})
					
						transport.sendMail({
							to: user.userName,
							from: 'admin@qref.com',
							subject: 'QRef Mobile - Password Reset',
							html: data
						}, (err, result) ->
							if err?
								console.log(JSON.stringify(err))
						)
					else
						console.log("No email template found")
				)
				
				return
			else
				resp = new RpcResponse(null)
				resp.failure('Failed to generate new password', 500)
				res.json(resp, 200)
				return
		)
	
	getEmailTemplate: (file, callback) ->
		fs.readFile('../WebContent/email/' + file, 'utf8', (err, data) ->
			if err?
				console.log(JSON.stringify(err))
				callback(null);
				return
			
			if data?
				callback(data);
				return
			else
				callback(null);
				return
		)
		
	isValidRequest: (req) ->
		if req.body? and req.body?.mode? and req.body.mode == 'rpc' and req.body?.token?
			true
		else
			false 
	
module.exports = new PasswordRecoveryRoute()