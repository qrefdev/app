(function() {
  var ObjectId, Schema, UserProductSchema, UserProductSchemaInternal, mongoose;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  ObjectId = Schema.ObjectId;

  UserProductSchemaInternal = {
    user: {
      type: ObjectId,
      required: true,
      ref: 'users'
    },
    product: {
      type: ObjectId,
      required: true,
      ref: 'products'
    }
  };

  UserProductSchema = new Schema(UserProductSchemaInternal);

  UserProductSchema.index({
    user: 1,
    product: 1
  }, {
    unique: true
  });

  module.exports = UserProductSchema;

}).call(this);
