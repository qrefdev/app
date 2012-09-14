(function() {
  var AircraftManufacturerSchema, AircraftManufacturerSchemaInternal, ObjectId, Schema, mongoose;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  ObjectId = Schema.ObjectId;

  /*
  Schema representing a specific aircraft manufacturer. 
  @example MongoDB Collection
    db.aircraft.manufacturers
  @example MongoDB Indexes
    db.aircraft.manufacturers.ensureIndex({ name: 1 }, { unique: true })
  @author Nathan Klick
  @copyright QRef 2012
  @abstract
  */


  AircraftManufacturerSchemaInternal = (function() {

    function AircraftManufacturerSchemaInternal() {}

    /*
    	@property [String] (Required) The name of the manufacturer.
    */


    AircraftManufacturerSchemaInternal.prototype.name = {
      type: String,
      required: true,
      unique: true
    };

    /*
    	@property [String] (Optional) A detailed description of this manufacturer.
    */


    AircraftManufacturerSchemaInternal.prototype.description = {
      type: String,
      required: false
    };

    /*
    	@property [Array<ObjectId>] (Optional) A list of models associated with this manufacturer.
    	@see AircraftModelSchemaInternal
    */


    AircraftManufacturerSchemaInternal.prototype.models = [
      {
        type: ObjectId,
        ref: 'aircraft.models'
      }
    ];

    return AircraftManufacturerSchemaInternal;

  })();

  AircraftManufacturerSchema = new Schema(new AircraftManufacturerSchemaInternal());

  module.exports = AircraftManufacturerSchema;

}).call(this);
