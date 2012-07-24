(function() {
  var AuthTokenSchema, AuthTokenSchemaInternal, ObjectId, Schema, mongoose;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  ObjectId = Schema.ObjectId;

  AuthTokenSchemaInternal = {
    token: {
      type: String,
      required: true,
      unique: true
    },
    expiresOn: {
      type: Date,
      required: true
    },
    user: {
      type: ObjectId,
      ref: 'users',
      required: true
    }
  };

  AuthTokenSchema = new Schema(AuthTokenSchemaInternal);

  module.exports = AuthTokenSchema;

}).call(this);
