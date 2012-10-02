(function() {
  var AircraftProductAuthorizationAttemptSchema, AircraftProductAuthorizationAttemptSchemaInternal, Mixed, ObjectId, Schema, mongoose;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  ObjectId = Schema.ObjectId;

  Mixed = Schema.Types.Mixed;

  /*
  Schema representing a specific aircraft make and model. 
  @example MongoDB Collection
    db.aircraft.models
  @example MongoDB Indexes
    db.aircraft.models.ensureIndex({ name: 1, modelYear: 1 }, { unique: true })
  @author Nathan Klick
  @copyright QRef 2012
  @abstract
  */


  AircraftProductAuthorizationAttemptSchemaInternal = (function() {

    function AircraftProductAuthorizationAttemptSchemaInternal() {}

    AircraftProductAuthorizationAttemptSchemaInternal.prototype.user = {
      type: ObjectId,
      required: true,
      ref: 'users'
    };

    AircraftProductAuthorizationAttemptSchemaInternal.prototype.product = {
      type: ObjectId,
      required: true,
      ref: 'products'
    };

    AircraftProductAuthorizationAttemptSchemaInternal.prototype.attemptType = {
      type: String,
      required: true,
      "enum": ['apple', 'android']
    };

    AircraftProductAuthorizationAttemptSchemaInternal.prototype.isReceiptValid = {
      type: Boolean,
      required: true,
      "default": false
    };

    AircraftProductAuthorizationAttemptSchemaInternal.prototype.isComplete = {
      type: Boolean,
      required: true,
      "default": false
    };

    AircraftProductAuthorizationAttemptSchemaInternal.prototype.appleReceiptHash = {
      type: String,
      required: false,
      "default": null
    };

    AircraftProductAuthorizationAttemptSchemaInternal.prototype.appleReceipt = {
      type: Mixed,
      required: false,
      "default": null
    };

    AircraftProductAuthorizationAttemptSchemaInternal.prototype.androidReceiptHash = {
      type: String,
      required: false,
      "default": null
    };

    AircraftProductAuthorizationAttemptSchemaInternal.prototype.androidReceipt = {
      type: Mixed,
      required: false,
      "default": null
    };

    AircraftProductAuthorizationAttemptSchemaInternal.prototype.checklist = {
      type: ObjectId,
      required: false,
      "default": null,
      ref: 'aircraft.checklists'
    };

    return AircraftProductAuthorizationAttemptSchemaInternal;

  })();

  AircraftProductAuthorizationAttemptSchema = new Schema(new AircraftProductAuthorizationAttemptSchemaInternal());

  AircraftProductAuthorizationAttemptSchema.index({
    user: 1,
    product: 1
  });

  module.exports = AircraftProductAuthorizationAttemptSchema;

}).call(this);
