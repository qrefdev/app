(function() {
  var AuthTokenSchema, AuthTokenSchemaInternal, ObjectId, Schema, mongoose;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  ObjectId = Schema.ObjectId;

  /*
  Schema representing a time-limited user specific authentication token.
  @example MongoDB Collection
    db.user.tokens
  @example MongoDB Indexes
    db.user.tokens.ensureIndex({ token: 1 }, { unique: true })
  @author Nathan Klick
  @copyright QRef 2012
  @abstract
  */


  AuthTokenSchemaInternal = (function() {

    function AuthTokenSchemaInternal() {}

    /*
    	@property [String] (Required) A unique SHA-512 hash representing a user credential.
    */


    AuthTokenSchemaInternal.prototype.token = {
      type: String,
      required: true,
      unique: true
    };

    /*
    	@property [Date] (Required) The expiration date of the token.
    */


    AuthTokenSchemaInternal.prototype.expiresOn = {
      type: Date,
      required: true
    };

    /*
    	@property [ObjectId] (Required) The user that this token was issued for.
    */


    AuthTokenSchemaInternal.prototype.user = {
      type: ObjectId,
      ref: 'users',
      required: true
    };

    return AuthTokenSchemaInternal;

  })();

  AuthTokenSchema = new Schema(new AuthTokenSchemaInternal());

  module.exports = AuthTokenSchema;

}).call(this);
