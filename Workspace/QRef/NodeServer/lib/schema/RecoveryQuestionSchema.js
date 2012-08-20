(function() {
  var ObjectId, RecoveryQuestionSchema, RecoveryQuestionSchemaInternal, Schema, mongoose;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  ObjectId = Schema.ObjectId;

  RecoveryQuestionSchemaInternal = {
    question: {
      type: String,
      required: true,
      unique: true
    }
  };

  RecoveryQuestionSchema = new Schema(RecoveryQuestionSchemaInternal);

  module.exports = RecoveryQuestionSchema;

}).call(this);
