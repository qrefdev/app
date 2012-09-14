(function() {
  var AircraftModelSchema, AircraftModelSchemaInternal, ObjectId, Schema, mongoose;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  ObjectId = Schema.ObjectId;

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


  AircraftModelSchemaInternal = (function() {

    function AircraftModelSchemaInternal() {}

    /*
    	@property [String] (Required) The name of the model.
    */


    AircraftModelSchemaInternal.prototype.name = {
      type: String,
      required: true
    };

    /*
    	@property [String] (Optional) A detailed description of the model.
    */


    AircraftModelSchemaInternal.prototype.description = {
      type: String,
      required: false
    };

    /*
    	@property [ObjectId] (Required) The associated manufacturer of this model.
    	@see AircraftManufacturerSchemaInternal
    */


    AircraftModelSchemaInternal.prototype.manufacturer = {
      type: ObjectId,
      required: true,
      ref: 'aircraft.manufacturers'
    };

    /*
    	@property [String] (Required) A string representing the specific year of this model.
    */


    AircraftModelSchemaInternal.prototype.modelYear = {
      type: String,
      required: true
    };

    return AircraftModelSchemaInternal;

  })();

  AircraftModelSchema = new Schema(new AircraftModelSchemaInternal());

  AircraftModelSchema.index({
    name: 1,
    modelYear: 1
  }, {
    unique: true
  });

  module.exports = AircraftModelSchema;

}).call(this);
