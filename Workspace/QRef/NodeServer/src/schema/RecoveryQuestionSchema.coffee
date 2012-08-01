mongoose = require('mongoose')
Schema = mongoose.Schema
ObjectId = Schema.ObjectId

RecoveryQuestionSchemaInternal =
	question:
		type: String
		required: true
		unique: true

RecoveryQuestionSchema = new Schema(RecoveryQuestionSchemaInternal)
modules.exports = RecoveryQuestionSchema
	