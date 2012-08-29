crypto = require('crypto')
mongoose = require('mongoose')
QRefDatabase = require('../db/QRefDatabase')
ObjectId = mongoose.Types.ObjectId
class UserAuth 
	constructor: () ->
	salt: () -> 
		hash = crypto.createHash('sha512')
		hash.update(crypto.randomBytes(1024))
		hash.digest('hex')
	securePassword: (key, salt, password) ->
		sKey = key + salt
		hmac = crypto.createHmac('sha512', sKey)
		hmac.update(password)
		hmac.digest('hex')
	secureToken: (key, salt) ->
		sPassword = '' + Date.now() + crypto.randomBytes(64)
		@.securePassword(key, salt, sPassword)
	validateCredential: (userName, password, callback) ->
		db = QRefDatabase.instance()
		db.User.where('userName')
				.equals(userName)
				.findOne((err, user) => 
					if err? 
						callback(err, false)
					if user?
						pwHash = @.securePassword(user._id, user.passwordSalt, password)
						callback(null, pwHash == user.passwordHash)
					else
						callback(null, false)
				)
	validateToken: (token, callback) ->
		db = QRefDatabase.instance()
		db.AuthToken.where('token')
					 .equals(token)
					 .findOne((err, obj) =>
					 	if err?
					 		callback(err, false)
					 		return
					 	if obj?
					 		callback(null, Date.now() < obj.expiresOn)
					 	else
					 		callback(null, false)
					 )
	login: (userName, password, callback) ->
		db = QRefDatabase.instance()
	
			
		db.User.where('userName')
				.equals(userName)
				.findOne((err, user) =>
					if err?
						callback(err, null, false)
						return
					if user?
						pwHash = @.securePassword(user._id, user.passwordSalt, password)
						
						if pwHash == user.passwordHash
							expiry = new Date()
							expiry.setHours(expiry.getHours() + 336)
							tk = new db.AuthToken()
							tk.token = @.secureToken(user._id, user.passwordSalt)
							tk.expiresOn = expiry
							tk.user = user
							tk.save((error) ->
								if error?
									callback(error, null, false)
								else
									callback(null, tk.token, true)
							) 
						else
							callback(null, null, false)
					else
						callback(null, null, false)
		)
		
	validateRequest: (req, callback) ->
		@.validateToken(req.header('Authorization'), callback)
	refreshToken: (token, callback) ->
		db = QRefDatabase.instance()
		db.AuthToken.where('token')
					 .equals(token)
					 .findOne((err, obj) ->
					 	if err?
					 		callback(err, false)
					 		return
					 	if obj?
					 		if Date.now() < obj.expiresOn
					 			expiry = new Date()
					 			expiry.setHours(expiry.getHours() + 336)
					 			obj.expiresOn =  expiry
					 			obj.save((error) ->
					 				if error?
					 					callback(error, false)
					 				else
					 					callback(null, true) 
					 			)
					 		else
					 			callback(null, false)
					 	else
					 		callback(null, false)
					 )
	createAccount: (userName, password, callback) ->
		db = QRefDatabase.instance()
		userSalt = @.salt()
		userGuid = new ObjectId()
		userHash = @.securePassword(userGuid, userSalt, password)
		
		user = new db.User()
		user._id = userGuid
		user.passwordSalt = userSalt
		user.passwordHash = userHash
		user.emailAddress = userName
		user.userName = userName
		
		db.User.where('userName')
				.equals(userName)
				.find((err, arrObjs) ->
					if err?
						callback(err, false, 1)
						return
					if arrObjs? and arrObjs.length > 0
						callback(null, false, 2)
						return
					else
						user.save((err) ->
							if err?
								callback(err, false, 3)
							else
								callback(null, true, 0)
						)
					
				)
	userFromToken: (token, callback) ->
		db = QRefDatabase.instance()
		db.AuthToken.where('token')
					.equals(token)
					.populate('user')
					.findOne((err, tk) ->
						
						if err?
							callback(err, null)
							return
						if not tk?
							callback(true, null)
							return
						
						callback(null, tk.user)
			
					)
module.exports = new UserAuth()