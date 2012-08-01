mongoose = require('mongoose')
Schema = mongoose.Schema
ObjectId = Schema.ObjectId

UserSchemaInternal = 
	userName: 
		type: String
		required: true
		unique: true
	passwordHash: 
		type: String
		required: false
	passwordSalt: 
		type: String
		required: true
	firstName: 
		type: String
		required: false
	lastName:
		type: String
		required: false
	emailAddress:
		type: String
		required: true
	roles: [
		type: ObjectId,
		ref: 'user.roles'
	]
	recoveryQuestion:
		type: ObjectId
		ref: 'user.recovery.questions'
		required: true
	recoveryAnswer:
		type: String
		required: true

UserSchema = new Schema(UserSchemaInternal)
module.exports = UserSchema
	