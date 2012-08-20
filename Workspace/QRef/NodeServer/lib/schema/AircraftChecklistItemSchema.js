(function() {
  var AircraftChecklistItemSchema, AircraftChecklistItemSchemaInternal, ObjectId, Schema, mongoose;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  ObjectId = Schema.ObjectId;

  AircraftChecklistItemSchemaInternal = {
    icon: {
      type: String,
      required: false
    },
    index: {
      type: Number,
      required: true
    },
    check: {
      type: String,
      required: true
    },
    response: {
      type: String,
      required: true
    }
  };

  AircraftChecklistItemSchema = new Schema(AircraftChecklistItemSchemaInternal);

  module.exports = AircraftChecklistItemSchema;

}).call(this);
