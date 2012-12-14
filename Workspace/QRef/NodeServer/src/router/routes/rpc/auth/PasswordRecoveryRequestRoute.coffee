RpcRoute = require('../../../RpcRoute')
RpcResponse = require('../../../../serialization/RpcResponse')
UserAuth = require('../../../../security/UserAuth')
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
			
		UserAuth.createPasswordRecoveryToken(req.body.userName, (err, tk) ->
			if err?
				resp = new RpcResponse(null)
				resp.failure('Bad Request', 400)
				res.json(resp, 200)
				return
				
			if tk?
				resp = new RpcResponse(null)
				res.json(resp, 200)
				
				user = tk.user
				
				@.getEmailTemplate('passwordRecoveryRequest.html', (data) ->
					if data?
						data.replace('{recoveryUrl}', 'http://my.qref.com/?passwordRecovery=' + tk.token)
					
						Mailer.send({
							host: '10.1.224.10',
							port: '25',
							to: user.userName,
							from: 'admin@qref.com',
							subject: 'QRef Mobile - Password Recovery',
							body: data
						}, (err, result) ->
							
						)
				)
				
				return

			resp = new RpcResponse(null)
			resp.failure('Failed to generate password recovery token', 400)
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
		if req.body? and req.body?.mode? and req.body.mode == 'rpc' and req.body?.userName?
			true
		else
			false 
	
module.exports = new PasswordRecoveryRequestRoute()