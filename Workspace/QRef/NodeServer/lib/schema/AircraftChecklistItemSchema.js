(function() {
  var AircraftChecklistItemSchema, AircraftChecklistItemSchemaInternal, ObjectId, Schema, mongoose;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  ObjectId = Schema.ObjectId;

  /*
  Nested Schema representing a specific checklist item. 
  @note This is a nested document and does not have a separate Mongo collection.
  @note No indexes are defined because this is nested document. 
  @author Nathan Klick
  @copyright QRef 2012
  @abstract
  */


  AircraftChecklistItemSchemaInternal = (function() {

    function AircraftChecklistItemSchemaInternal() {}

    /*
    	@property [String] (Required) relative path to the image from the root of the server
    */


    AircraftChecklistItemSchemaInternal.prototype.icon = {
      type: String,
      required: false
    };

    /*
    	@property [Number] (Required) a numerical index indicating the order of the element
    */


    AircraftChecklistItemSchemaInternal.prototype.index = {
      type: Number,
      required: true
    };

    /*
    	@property [String] (Required) the item's check value
    */


    AircraftChecklistItemSchemaInternal.prototype.check = {
      type: String,
      required: true
    };

    /*
    	@property [String] (Required) the item's response value
    */


    AircraftChecklistItemSchemaInternal.prototype.response = {
      type: String,
      required: true
    };

    return AircraftChecklistItemSchemaInternal;

  })();

  AircraftChecklistItemSchema = new Schema(new AircraftChecklistItemSchemaInternal());

  module.exports = AircraftChecklistItemSchema;

}).call(this);
