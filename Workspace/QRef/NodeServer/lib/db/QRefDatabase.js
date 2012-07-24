(function() {
  var QRefDatabase, mongoose;

  mongoose = require('mongoose');

  QRefDatabase = (function() {

    QRefDatabase.prototype.connection = null;

    QRefDatabase.prototype.url = 'mongodb://localhost/qref';

    QRefDatabase.prototype.Users = null;

    QRefDatabase.prototype.AuthTokens = null;

    QRefDatabase.prototype.Schema = mongoose.Schema;

    function QRefDatabase() {
      this.connection = mongoose.createConnection(this.url);
      this.initialize();
    }

    QRefDatabase.prototype.initialize = function() {
      var AuthTokenSchema, UserSchema;
      UserSchema = require('../schema/UserSchema');
      this.Users = this.connection.model('users', UserSchema);
      AuthTokenSchema = require('../schema/AuthTokenSchema');
      return this.AuthTokens = this.connection.model('authTokens', AuthTokenSchema);
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
