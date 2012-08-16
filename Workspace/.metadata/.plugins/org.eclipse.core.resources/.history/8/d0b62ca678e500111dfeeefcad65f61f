mongoose = require('mongoose')
class QRefDatabase
	connection: null
	url: 'mongodb://qref:qref@localhost/qref'
	Users: null
	AuthTokens: null
	Roles: null
	RecoveryQuestions: null
	Schema: mongoose.Schema
	constructor: () ->
		@connection = mongoose.createConnection(@url)
		@.initialize()
	initialize: () ->
		RoleSchema = require('../schema/RoleSchema')
		@Roles = @connection.model('user.roles', RoleSchema)
		RecoveryQuestionSchema = require('../schema/RecoveryQuestionSchema')
		@RecoveryQuestions = @connection.model('user.recovery.questions', RecoveryQuestionSchema)
		UserSchema = require('../schema/UserSchema')
		@Users = @connection.model('users', UserSchema)
		AuthTokenSchema = require('../schema/AuthTokenSchema')
		@AuthTokens = @connection.model('user.tokens', AuthTokenSchema)
	getConnection: () -> @connection
	getUrl: () -> @url
module.exports = QRefDatabase
		