(function() {
  var ObjectId, Schema, UserSchema, UserSchemaInternal, mongoose;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  ObjectId = Schema.ObjectId;

  /*
  Schema representing an individual user object including their associated credentials, email address, and password recovery information. 
  @example MongoDB Collection
    db.users
  @example MongoDB Indexes
    db.users.ensureIndex({ userName: 1 }, { unique: true })
  @author Nathan Klick
  @copyright QRef 2012
  @abstract
  */


  UserSchemaInternal = (function() {

    function UserSchemaInternal() {}

    /*
    	@property [String] (Required) The username used to perform authentication. This should always be the user's email address.
    */


    UserSchemaInternal.prototype.userName = {
      type: String,
      required: true,
      unique: true
    };

    /*
    	@property [String] (Required) A SHA-512 HMAC representing the user's password.
    */


    UserSchemaInternal.prototype.passwordHash = {
      type: String,
      required: true
    };

    /*
    	@property [String] (Required) A random SHA-512 hash used as a salt value in the password HMAC.
    */


    UserSchemaInternal.prototype.passwordSalt = {
      type: String,
      required: true
    };

    /*
    	@property [String] (Optional) The first name of the user.
    */


    UserSchemaInternal.prototype.firstName = {
      type: String,
      required: false
    };

    /*
    	@property [String] (Optional) The last name (surname) of the user.
    */


    UserSchemaInternal.prototype.lastName = {
      type: String,
      required: false
    };

    /*
    	@property [String] (Required) The user's email address.
    */


    UserSchemaInternal.prototype.emailAddress = {
      type: String,
      required: true
    };

    /*
    	@property [Array<ObjectId>] (Optional) The list of roles possessed by this user.
    */


    UserSchemaInternal.prototype.roles = [
      {
        type: ObjectId,
        ref: 'user.roles'
      }
    ];

    /*
    	@property [ObjectId] (Optional) The chosen recovery question for this user.
    */


    UserSchemaInternal.prototype.recoveryQuestion = {
      type: ObjectId,
      ref: 'user.recovery.questions',
      required: false
    };

    /*
    	@property [String] (Optional) An SHA-512 HMAC represting the user's answer to their recovery question.
    */


    UserSchemaInternal.prototype.recoveryAnswer = {
      type: String,
      required: false
    };

    return UserSchemaInternal;

  })();

  UserSchema = new Schema(new UserSchemaInternal());

  module.exports = UserSchema;

}).call(this);
