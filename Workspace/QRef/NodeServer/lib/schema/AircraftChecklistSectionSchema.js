(function() {
  var AircraftChecklistItemSchema, AircraftChecklistSectionSchema, AircraftChecklistSectionSchemaInternal, ObjectId, Schema, mongoose;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  ObjectId = Schema.ObjectId;

  AircraftChecklistItemSchema = require('./AircraftChecklistItemSchema');

  /*
  Nested Schema representing a specific checklist section. 
  @note This is a nested document and does not have a separate Mongo collection.
  @note No indexes are defined because this is nested document.
  @author Nathan Klick
  @copyright QRef 2012
  @abstract
  */


  AircraftChecklistSectionSchemaInternal = (function() {

    function AircraftChecklistSectionSchemaInternal() {}

    /*
    	@property [String] (Required) An enum value indicating the section type. Valid values are ['standard', 'emergency'].
    */


    AircraftChecklistSectionSchemaInternal.prototype.sectionType = {
      type: String,
      required: true,
      "enum": ['standard', 'emergency']
    };

    /*
    	@property [Number] (Required) A numeric value indicating the position of this section relative to other sections.
    */


    AircraftChecklistSectionSchemaInternal.prototype.index = {
      type: Number,
      required: true
    };

    /*
    	@property [String] (Required) The name of this checklist section as displayed in the application.
    */


    AircraftChecklistSectionSchemaInternal.prototype.name = {
      type: String,
      required: true
    };

    /*
    	@property [Array<AircraftChecklistItemSchemaInternal>] (Optional) An array of ordered checklist items.
    */


    AircraftChecklistSectionSchemaInternal.prototype.items = {
      type: [AircraftChecklistItemSchema],
      required: false
    };

    /*
    	@property [String] (Optional) A path to the sections icon relative to the root of the server.
    */


    AircraftChecklistSectionSchemaInternal.prototype.sectionIcon = {
      type: String,
      required: false
    };

    return AircraftChecklistSectionSchemaInternal;

  })();

  AircraftChecklistSectionSchema = new Schema(new AircraftChecklistSectionSchemaInternal());

  module.exports = AircraftChecklistSectionSchema;

}).call(this);
