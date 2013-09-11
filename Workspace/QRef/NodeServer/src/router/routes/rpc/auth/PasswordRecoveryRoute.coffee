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
			
		UserAuth.applyPasswordRecovery(req.body.code, req.body.password, (err) =>
			if err?
				resp = new RpcResponse(null)
				resp.failure('Invalid Auth Code', 500)
				res.json(resp, 200)
				return
				
			resp = new RpcResponse(null)
			res.json(resp, 200)
			
			@.getEmailTemplate('passwordChanged.html', (data) ->
						if data?
							console.log(data)		
							transport = Mailer.createTransport("SMTP", {
								host: '10.1.224.110',
								port: 25,
							})
										
							transport.sendMail({
								to: user.userName,
								from: 'admin@qref.com',
								subject: 'QRef Mobile - Password Changed',
								html: data
							}, (err, result) ->
								if err?
									console.log(JSON.stringify(err))
							)
						else
							console.log("No email template found")
					)
			
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
		if req.body? and req.body?.mode? and req.body.mode == 'rpc' and req.body?.code? and req.body?.password?
			true
		else
			false 
	
module.exports = new PasswordRecoveryRoute()