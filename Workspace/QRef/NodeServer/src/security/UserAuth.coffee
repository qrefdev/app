crypto = require('crypto')
mongoose = require('mongoose')
QRefDatabase = require('../db/QRefDatabase')
ObjectId = mongoose.Types.ObjectId
Dictionary = require('../collections/Dictionary')
async = require('async')
###
Secure utility methods for managing users, credentials, and tokens.
@author Nathan Klick
@copyright QRef 2012
###
class UserAuth 
	###
	Creates a new UserAuth object instance.
	###
	constructor: () ->
	###
	Generates a random salt.
	@return [String] A hexadecimal string representing a SHA-512 hash.
	###
	salt: () -> 
		hash = crypto.createHash('sha512')
		hash.update(crypto.randomBytes(1024))
		hash.digest('hex')
	###
	Performs an HMAC transformation on a password using a given key and salt values.
	@param key [String] The key to use with the HMAC algorithm.
	@param salt [String] A hexadecimal string representing a SHA-512 salt value.
	@param password [String] The clear text password to be encoded.
	@return [String] A hexadecimal string representing a secure SHA-512 HMAC representation of the clear text password.
	###
	securePassword: (key, salt, password) ->
		sKey = key + salt
		hmac = crypto.createHmac('sha512', sKey)
		hmac.update(password)
		hmac.digest('hex')
	###
	Generates a random secure token using the given key and salt values.
	@param key [String] The key to use with the HMAC algorithm.
	@param salt [String] A hexadecimal string representing a SHA-512 salt value.
	@return [String] A hexadecimal string representing a secure random token.
	###
	secureToken: (key, salt) ->
		sPassword = '' + Date.now() + crypto.randomBytes(64)
		@.securePassword(key, salt, sPassword)
	###
	Validates a given userName and password against the database.
	@param userName [String] The username to validate.
	@param password [String] The clear text password to validate.
	@param callback [Function] A function meeting the requirements of the {Callbacks#userAuthValidateCredentialCallback} method.
	###
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
	###
	Validate a secure token against the database records.
	@param token [String] A hexadecimal string representing a secure token.
	@param callback [Function] A function meeting the requirements of the {Callbacks#userAuthValidateCredentialCallback} method.
	###
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
	###
	Validates a set of user credentials against the database and issues a valid token if the credentials are valid.
	@param userName [String] The username to validate.
	@param password [String] The clear text password to validate.
	@param callback [Function] A function meeting the requirements of the {Callbacks#userAuthLoginCallback} method.
	###
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
	###
	A helper method user to extract a token from the Authorization HTTP header and pass it to the {#validateToken} method.
	@param req [Express.Request] The HTTP request object.
	@param callback [Function] A function meeting the requirements of the {Callbacks#userAuthValidateCredentialCallback} method.
	###
	validateRequest: (req, callback) ->
		@.validateToken(req.header('Authorization'), callback)
	###
	Validates and extends the life of an existing secure token.
	@param token [String] A hexadecimal string representing a secure token.
	@param callback [Function] A function meeting the requirements of the {Callbacks#userAuthValidateCredentialCallback} method.
	###
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
	###
	Creates a new user account with no roles.
	@param userName [String] The userName to create. This should always be the email address of the user.
	@param password [String] The clear text password provided by the user.
	@param callback [Function] A function meeting the requirements of the {Callbacks#userAuthCreateAccountCallback} method.
	###
	createAccount: (userName, password, callback) ->
		db = QRefDatabase.instance()
		userSalt = @.salt()
		userGuid = new ObjectId()
		userHash = @.securePassword(userGuid, userSalt, password)
		
		db.Role.where('roleName')
			.equals('Users')
			.findOne((err, role) ->
				
				if err?
					callback(err, false, 4)
					return
				
				if not role?
					callback(err, false, 5)
					return
				
				user = new db.User()
				user._id = userGuid
				user.passwordSalt = userSalt
				user.passwordHash = userHash
				user.emailAddress = userName
				user.userName = userName
				user.roles.push(role._id)
				
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
			)
	###
	Retrieves the associate user account for a secure token.
	@param token [String] A hexadecimal string representing a secure token.
	@param callback [Function] A function meeting the requirements of the {Callbacks#userAuthUserFromTokenCallback} method.
	###
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
	###
	Determines if the currently authenticated user is in the given role.
	@param token [String] A hexadecimal string representing a secure token.
	@param roleName [String] The name of the role. 
	@param callback [Function] A function meeting the requirements of the {Callbacks#userAuthIsInRoleCallback} method.
	###
	isInRole: (token, roleName, callback) ->
		db = QRefDatabase.instance()
		db.AuthToken.where('token')
				.equals(token)
				.populate('user')
				.findOne((err, tk) -> 
					
					if err?
						callback(err, false);
						return
						
					if not tk?
						callback(null, false);	
						return
					
					db.Role.where('roleName')
						.equals(roleName)
						.findOne((err, role) ->
							if err?
								callback(err, false)
								return
							
							if not role?
								callback(null, false)
								return
							
							bFound = false
							
							async.forEach(tk.user.roles, 
								(item, cb) ->
									if item.toString() == role._id.toString()
										bFound = true
									cb(null)
								, (err) ->
									callback(null, bFound)
							)
						)
				)
	###
	Determines if the currently authenticated user is in any of the listed roles.
	@param token [String] A hexadecimal string representing a secure token.
	@param roles [Array<String>] The array of roles for which to check for membership.
	@param callback [Function] A function meeting the requirements of the {Callbacks#userAuthIsInRoleCallback} method.
	###
	isInAnyRole: (token, roles, callback) ->
		db = QRefDatabase.instance()
		db.AuthToken.where('token')
			.equals(token)
			.populate('user')
			.findOne((err, tk) -> 
				
				if err?
					callback(err, false);
					return
					
				if not tk?
					callback(null, false);	
					return
					
				arrQueryEntries = []
				
				arrQueryEntries.push({ roleName: r }) for r in roles
				
				db.Role.find({ "$or": arrQueryEntries })
						.exec((err, arrRoles) ->
							if err?
								callback(err, false)
								return
							
							if arrRoles.length == 0
								callback(null, false)
								return
							
							bFound = false
							dctRoleKeys = new Dictionary()
							
							dctRoleKeys.set(r._id.toString(), r.roleName) for r in arrRoles
							
							
							async.forEach(tk.user.roles, 
								(item, cb) ->
									if dctRoleKeys.containsKey(item.toString())
										bFound = true
									cb(null)
								, (err) ->
									callback(err, bFound)
							)
						)
			)
module.exports = new UserAuth()