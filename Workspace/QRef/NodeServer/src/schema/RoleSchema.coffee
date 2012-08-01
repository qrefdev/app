mongoose = require('mongoose')
Schema = mongoose.Schema
ObjectId = Schema.ObjectId

RoleSchemaInternal = 
	roleName:
		type: String
		required: true
		unique: true
	description:
		type: String
		required: false

RoleSchema = new Schema(RoleSchemaInternal)
module.exports = RoleSchema