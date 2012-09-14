(function() {
  var ObjectId, RecoveryQuestionSchema, RecoveryQuestionSchemaInternal, Schema, mongoose;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  ObjectId = Schema.ObjectId;

  /*
  Schema representing a common password recovery question available for use by the users.
  @example MongoDB Collection
    db.user.recovery.questions
  @example MongoDB Indexes
    db.user.recovery.questions.ensureIndex({ question: 1 }, { unique: true })
  @author Nathan Klick
  @copyright QRef 2012
  @abstract
  */


  RecoveryQuestionSchemaInternal = (function() {

    function RecoveryQuestionSchemaInternal() {}

    /*
    	@property [String] (Required) A unique question available to all users for the purpose of password recovery.
    */


    RecoveryQuestionSchemaInternal.prototype.question = {
      type: String,
      required: true,
      unique: true
    };

    return RecoveryQuestionSchemaInternal;

  })();

  RecoveryQuestionSchema = new Schema(new RecoveryQuestionSchemaInternal());

  module.exports = RecoveryQuestionSchema;

}).call(this);
