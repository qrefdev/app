mongoose = require('mongoose')
class QRefDatabase
	connection: null
	url: 'mongodb://qref:qref@localhost/qref'
	User: null
	AuthToken: null
	Role: null
	RecoveryQuestion: null
	AircraftManufacturer: null
	AircraftModel: null
	AircraftChecklist: null
	Product: null
	UserProduct: null
	Schema: mongoose.Schema
	constructor: () ->
		@connection = mongoose.createConnection(@url)
		@.initialize()
	initialize: () ->
		RoleSchema = require('../schema/RoleSchema')
		@Role = @connection.model('user.roles', RoleSchema)
		RecoveryQuestionSchema = require('../schema/RecoveryQuestionSchema')
		@RecoveryQuestion = @connection.model('user.recovery.questions', RecoveryQuestionSchema)
		UserSchema = require('../schema/UserSchema')
		@User = @connection.model('users', UserSchema)
		AuthTokenSchema = require('../schema/AuthTokenSchema')
		@AuthToken = @connection.model('user.tokens', AuthTokenSchema)
		AircraftManufacturerSchema = require('../schema/AircraftManufacturerSchema')
		@AircraftManufacturer = @connection.model('aircraft.manufacturers', AircraftManufacturerSchema)
		AircraftModelSchema = require('../schema/AircraftModelSchema')
		@AircraftModel = @connection.model('aircraft.models', AircraftModelSchema)
		AircraftChecklistSchema = require('../schema/AircraftChecklistSchema')
		@AircraftChecklist = @connection.model('aircraft.checklists', AircraftChecklistSchema)
		ProductSchema = require('../schema/ProductSchema')
		@Product = @connection.model('products', ProductSchema)
		UserProductSchema = require('../schema/UserProductSchema')
		@UserProduct = @connection.model('user.products', UserProductSchema)
	getConnection: () -> @connection
	getUrl: () -> @url
module.exports = QRefDatabase
		