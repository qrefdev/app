mongoose = require('mongoose')
Schema = mongoose.Schema
ObjectId = Schema.ObjectId

###
Schema representing a time-limited user specific authentication token.
@example MongoDB Collection
  db.user.tokens
@example MongoDB Indexes
  db.user.tokens.ensureIndex({ token: 1 }, { unique: true })
@author Nathan Klick
@copyright QRef 2012
@abstract
###
class AuthCodeSchemaInternal 
	###
	@property [String] (Required) A unique SHA-512 hash representing a user credential.
	###
	code: 
		type: String
		required: true
		unique: true
	###
	@property [Date] (Required) The expiration date of the token.
	###
	expiresOn:
		type: Date
		required: true
	###
	@property [ObjectId] (Required) The user that this token was issued for.
	###
	user: 
		type: ObjectId
		ref: 'users'
		required: true

AuthCodeSchema = new Schema(new AuthCodeSchemaInternal())
module.exports = AuthCodeSchema
	