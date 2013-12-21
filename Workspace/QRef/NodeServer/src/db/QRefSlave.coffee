mongoose = require('mongoose')
###
Database middleware class that handles connection setup and exposes available data models.
Creating multiple instances of this class will create a new connection for each instance; therefore, 
the application only spins up one copy of this class at startup and exposes a global variable named QRefDatabase 
which is reused through the application. The convience method {#instance} is used to grab a reference off of 
this global QRefDatabase variable. Only one connection to the MongoDB server is ever needed for the life of the 
application because all requests to mongo occur in an evented manner and a single connection object can handle 
multiple requests at a time. 

@example Getting a reference from QRefDatabase global variable
  db = QRefSlave.instance()

@author Nathan Klick
@copyright QRef 2012
###
class QRefSlave
	###
	@property [Mongoose.Connection] The underlying mongoose connection object.
	###
	connection: null
	###
	@property [String] The mongodb URL to use in establishing the mongoose connection object.
	###
	url: ''
	###
	@property [String] The name of the slave object.
	###
	name: ''
	###
	@property [UserSchemaInternal] A reference to the User model.
	###
	User: null
	###
	@property [AuthTokenSchemaInternal] A reference to the AuthToken model.
	###
	AuthToken: null
	###
	@property [AuthCodeSchemaInternal] a reference to AuthCode model
	###
	AuthCode: null
	###
	@property [RoleSchemaInternal] A reference to the Role model.
	###
	Role: null
	###
	@property [RecoveryQuestionSchemaInternal] A reference to the RecoveryQuestion model.
	###
	RecoveryQuestion: null
	###
	@property [AircraftManufacturerSchemaInternal] A reference to the AircraftManufacturer model.
	###
	AircraftManufacturer: null
	###
	@property [AircraftModelSchemaInternal] A reference to the AircraftModel model.
	###
	AircraftModel: null
	###
	@property [AircraftChecklistSchemaInternal] A reference to the AircraftChecklist model.
	###
	AircraftChecklist: null
	###
	@property [ProductSchemaInternal] A reference to the Product model.
	###
	Product: null
	###
	@property [UserProductSchemaInternal] A reference to the UserProduct model.
	###
	UserProduct: null
	###
	@property [AircraftProductAuthorizationAttemptSchemaInternal] A reference to the AircraftProductAuthorizationAttempt model.
	###
	AircraftProductAuthorizationAttempt: null
	###
	@property [Mongoose.Schema] A convenience property for accessing the Mongoose.Schema object.
	###
	Schema: mongoose.Schema
	###
	Create a new instance of the QRefDatabase object, connects to mongodb, and calls the {#initialize} method.
	###
	constructor: (name, mongoUrl) ->
		@name = name
		@url = mongoUrl
		@connection = mongoose.createConnection(@url)
		@.initialize()
	###
	Attaches all the schemas to mongoose and sets up the model references.
	###
	initialize: () ->
		RoleSchema = require('../schema/RoleSchema')
		@Role = @connection.model('user.roles', RoleSchema)
		RecoveryQuestionSchema = require('../schema/RecoveryQuestionSchema')
		@RecoveryQuestion = @connection.model('user.recovery.questions', RecoveryQuestionSchema)
		UserSchema = require('../schema/UserSchema')
		@User = @connection.model('users', UserSchema)
		AuthTokenSchema = require('../schema/AuthTokenSchema')
		@AuthToken = @connection.model('user.tokens', AuthTokenSchema)
		AuthCodeSchema = require('../schema/AuthCodeSchema')
		@AuthCode = @connection.model('user.auth.codes', AuthCodeSchema)
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
		AircraftProductAuthorizationAttemptSchema = require('../schema/AircraftProductAuthorizationAttemptSchema')
		@AircraftProductAuthorizationAttempt = @connection.model('aircraft.product.authorization.attempt', AircraftProductAuthorizationAttemptSchema)
	###
	Returns a reference to the underlying mongoose connection.
	@return [Mongoose.Connection] The underlying mongoose connection object.
	###
	getConnection: () -> @connection
	###
	Returns the URL used to establish the underlying mongodb connection.
	@return [String] The mongodb URL.
	###
	getUrl: () -> @url
	
	###
	Returns the name of the slave object.
	@return [String] The name of this slave object.
	###
	getName: () -> @name
	
	###
	Safety method for retrieving a reference to the current instance of this object.
	@return [QRefDatabase] A reference to the current instance of this object.
	###
	instance: () -> @
module.exports = QRefSlave
		