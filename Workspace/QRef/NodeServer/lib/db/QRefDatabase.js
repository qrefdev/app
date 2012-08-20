(function() {
  var QRefDatabase, mongoose;

  mongoose = require('mongoose');

  QRefDatabase = (function() {

    QRefDatabase.prototype.connection = null;

    QRefDatabase.prototype.url = 'mongodb://qref:qref@localhost/qref';

    QRefDatabase.prototype.User = null;

    QRefDatabase.prototype.AuthToken = null;

    QRefDatabase.prototype.Role = null;

    QRefDatabase.prototype.RecoveryQuestion = null;

    QRefDatabase.prototype.AircraftManufacturer = null;

    QRefDatabase.prototype.AircraftModel = null;

    QRefDatabase.prototype.AircraftChecklist = null;

    QRefDatabase.prototype.Product = null;

    QRefDatabase.prototype.UserProduct = null;

    QRefDatabase.prototype.Schema = mongoose.Schema;

    function QRefDatabase() {
      this.connection = mongoose.createConnection(this.url);
      this.initialize();
    }

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

    QRefDatabase.prototype.getConnection = function() {
      return this.connection;
    };

    QRefDatabase.prototype.getUrl = function() {
      return this.url;
    };

    return QRefDatabase;

  })();

  module.exports = QRefDatabase;

}).call(this);
