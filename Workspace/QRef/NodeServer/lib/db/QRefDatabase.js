(function() {
  var QRefDatabase, mongoose;

  mongoose = require('mongoose');

  /*
  Database middleware class that handles connection setup and exposes available data models.
  Creating multiple instances of this class will create a new connection for each instance; therefore, 
  the application only spins up one copy of this class at startup and exposes a global variable named QRefDatabase 
  which is reused through the application. The convience method {#instance} is used to grab a reference off of 
  this global QRefDatabase variable. Only one connection to the MongoDB server is ever needed for the life of the 
  application because all requests to mongo occur in an evented manner and a single connection object can handle 
  multiple requests at a time. 
  
  @example Getting a reference from QRefDatabase global variable
    db = QRefDatabase.instance()
  
  @author Nathan Klick
  @copyright QRef 2012
  */


  QRefDatabase = (function() {
    /*
    	@property [Mongoose.Connection] The underlying mongoose connection object.
    */

    QRefDatabase.prototype.connection = null;

    /*
    	@property [String] The mongodb URL to use in establishing the mongoose connection object.
    */


    QRefDatabase.prototype.url = 'mongodb://qref:qref@localhost/qref';

    /*
    	@property [UserSchemaInternal] A reference to the User model.
    */


    QRefDatabase.prototype.User = null;

    /*
    	@property [AuthTokenSchemaInternal] A reference to the AuthToken model.
    */


    QRefDatabase.prototype.AuthToken = null;

    /*
    	@property [RoleSchemaInternal] A reference to the Role model.
    */


    QRefDatabase.prototype.Role = null;

    /*
    	@property [RecoveryQuestionSchemaInternal] A reference to the RecoveryQuestion model.
    */


    QRefDatabase.prototype.RecoveryQuestion = null;

    /*
    	@property [AircraftManufacturerSchemaInternal] A reference to the AircraftManufacturer model.
    */


    QRefDatabase.prototype.AircraftManufacturer = null;

    /*
    	@property [AircraftModelSchemaInternal] A reference to the AircraftModel model.
    */


    QRefDatabase.prototype.AircraftModel = null;

    /*
    	@property [AircraftChecklistSchemaInternal] A reference to the AircraftChecklist model.
    */


    QRefDatabase.prototype.AircraftChecklist = null;

    /*
    	@property [ProductSchemaInternal] A reference to the Product model.
    */


    QRefDatabase.prototype.Product = null;

    /*
    	@property [UserProductSchemaInternal] A reference to the UserProduct model.
    */


    QRefDatabase.prototype.UserProduct = null;

    /*
    	@property [Mongoose.Schema] A convenience property for accessing the Mongoose.Schema object.
    */


    QRefDatabase.prototype.Schema = mongoose.Schema;

    /*
    	Create a new instance of the QRefDatabase object, connects to mongodb, and calls the {#initialize} method.
    */


    function QRefDatabase() {
      this.connection = mongoose.createConnection(this.url);
      this.initialize();
    }

    /*
    	Attaches all the schemas to mongoose and sets up the model references.
    */


    QRefDatabase.prototype.initialize = function() {
      var AircraftChecklistSchema, AircraftManufacturerSchema, AircraftModelSchema, AuthTokenSchema, ProductSchema, RecoveryQuestionSchema, RoleSchema, UserProductSchema, UserSchema;
      RoleSchema = require('../schema/RoleSchema');
      this.Role = this.connection.model('user.roles', RoleSchema);
      RecoveryQuestionSchema = require('../schema/RecoveryQuestionSchema');
      this.RecoveryQuestion = this.connection.model('user.recovery.questions', RecoveryQuestionSchema);
      UserSchema = require('../schema/UserSchema');
      this.User = this.connection.model('users', UserSchema);
      AuthTokenSchema = require('../schema/AuthTokenSchema');
      this.AuthToken = this.connection.model('user.tokens', AuthTokenSchema);
      AircraftManufacturerSchema = require('../schema/AircraftManufacturerSchema');
      this.AircraftManufacturer = this.connection.model('aircraft.manufacturers', AircraftManufacturerSchema);
      AircraftModelSchema = require('../schema/AircraftModelSchema');
      this.AircraftModel = this.connection.model('aircraft.models', AircraftModelSchema);
      AircraftChecklistSchema = require('../schema/AircraftChecklistSchema');
      this.AircraftChecklist = this.connection.model('aircraft.checklists', AircraftChecklistSchema);
      ProductSchema = require('../schema/ProductSchema');
      this.Product = this.connection.model('products', ProductSchema);
      UserProductSchema = require('../schema/UserProductSchema');
      return this.UserProduct = this.connection.model('user.products', UserProductSchema);
    };

    /*
    	Returns a reference to the underlying mongoose connection.
    	@return [Mongoose.Connection] The underlying mongoose connection object.
    */


    QRefDatabase.prototype.getConnection = function() {
      return this.connection;
    };

    /*
    	Returns the URL used to establish the underlying mongodb connection.
    	@return [String] The mongodb URL.
    */


    QRefDatabase.prototype.getUrl = function() {
      return this.url;
    };

    /*
    	Safety method for retrieving a reference to the current instance of this object.
    	@return [QRefDatabase] A reference to the current instance of this object.
    */


    QRefDatabase.prototype.instance = function() {
      return this;
    };

    return QRefDatabase;

  })();

  module.exports = new QRefDatabase();

}).call(this);
