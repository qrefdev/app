(function() {
  var ObjectId, Schema, UserSchema, UserSchemaInternal, mongoose;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  ObjectId = Schema.ObjectId;

  UserSchemaInternal = {
    userName: {
      type: String,
      required: true,
      unique: true
    },
    passwordHash: {
      type: String,
      required: false
    },
    passwordSalt: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: false
    },
    lastName: {
      type: String,
      required: false
    }
  };

  UserSchema = new Schema(UserSchemaInternal);

  module.exports = UserSchema;

}).call(this);
