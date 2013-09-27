RpcRoute = require('../../../RpcRoute')
RpcResponse = require('../../../../serialization/RpcResponse')
UserAuth = require('../../../../security/UserAuth')
Mailer = require('nodemailer')
fs = require('fs')
###
Service route that is used to create a new user account.
Password Recovery Request Email!
###
class PasswordRecoveryRequestRoute extends RpcRoute
	constructor: () ->
		super [{ method: 'POST', path: '/passwordRecoveryRequest' }]
	post: (req, res) =>
		if not @.isValidRequest(req)
			resp = new RpcResponse(null)
			resp.failure('Bad Request', 400)
			res.json(resp, 200)
			return
			
		UserAuth.createPasswordAuthCode(req.body.userName, (err, tk) =>
			if err?
				resp = new RpcResponse(null)
				resp.failure('Internal Error', 500)
				res.json(resp, 200)
				return
				
			if tk?
				resp = new RpcResponse(null)
				res.json(resp, 200)
				
				user = tk.user
				
				@.getEmailTemplate('passwordRecoveryRequest.html', (data) ->
					if data?
						data = data.replace(/\{COPYDATE\}/gi, (new Date()).getFullYear());
						data = data.replace(/\{recoveryCode\}/g, tk.code)
						transport = Mailer.createTransport("SMTP", {
							host: '10.1.224.110',
							port: 25,
						})
					
						transport.sendMail({
							to: user.userName,
							from: 'admin@qref.com',
							subject: 'QRef Mobile - Password Recovery',
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
				resp.failure('Failed to generate password recovery token', 500)
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
		if req.body? and req.body?.mode? and req.body.mode == 'rpc' and req.body?.userName?
			true
		else
			false 
	
module.exports = new PasswordRecoveryRequestRoute()