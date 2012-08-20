(function() {
  var AircraftModelSchema, AircraftModelSchemaInternal, ObjectId, Schema, mongoose;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  ObjectId = Schema.ObjectId;

  AircraftModelSchemaInternal = {
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: false
    },
    manufacturer: {
      type: ObjectId,
      required: true,
      ref: 'aircraft.manufacturers'
    }
  };

  AircraftModelSchema = new Schema(AircraftModelSchemaInternal);

  module.exports = AircraftModelSchema;

}).call(this);
