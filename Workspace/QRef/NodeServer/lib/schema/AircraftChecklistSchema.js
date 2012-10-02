(function() {
  var AircraftChecklistSchema, AircraftChecklistSchemaInternal, AircraftChecklistSectionSchema, ObjectId, Schema, mongoose;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  ObjectId = Schema.ObjectId;

  AircraftChecklistSectionSchema = require('./AircraftChecklistSectionSchema');

  /*
  Schema representing a manufacturer/model specific checklist. 
  @example MongoDB Collection
    db.aircraft.checklists
  @example MongoDB Indexes
    db.aircraft.checklists.ensureIndex({ manufacturer: 1, model: 1, version: 1, tailNumber: 1 }, { unique: true })
  @author Nathan Klick
  @copyright QRef 2012
  @abstract
  */


  AircraftChecklistSchemaInternal = (function() {

    function AircraftChecklistSchemaInternal() {}

    /*
    	@property [ObjectId] (Required) The manufacturer that this checklist is built against.
    	@see AircraftManufacturerSchemaInternal
    */


    AircraftChecklistSchemaInternal.prototype.manufacturer = {
      type: ObjectId,
      ref: 'aircraft.manufacturers',
      required: true
    };

    /*
    	@property [ObjectId] (Required) The model that this checklist is built against.
    	@see AircraftModelSchemaInternal
    */


    AircraftChecklistSchemaInternal.prototype.model = {
      type: ObjectId,
      ref: 'aircraft.models',
      required: true
    };

    /*
    	@property [Number] (Optional) The order in which this checklist should appear relative to the other checklists.
    */


    AircraftChecklistSchemaInternal.prototype.index = {
      type: Number,
      required: false,
      "default": null
    };

    /*
    	@property [String] (Optional) The tail number for a list which has been customized to a specific plane.
    */


    AircraftChecklistSchemaInternal.prototype.tailNumber = {
      type: String,
      required: false,
      "default": null
    };

    /*
    	@property [ObjectId] (Optional) The user which owns this customized version of the checklist.
    	@see UserSchemaInternal
    */


    AircraftChecklistSchemaInternal.prototype.user = {
      type: ObjectId,
      ref: 'users',
      required: false,
      "default": null
    };

    /*
    	@property [Number] (Required) The version number of this checklist.
    */


    AircraftChecklistSchemaInternal.prototype.version = {
      type: Number,
      required: true,
      "default": 1
    };

    /*
    	@property [String] (Optional) A server-based relative path to the product icon. This path should be relative to the server root.
    */


    AircraftChecklistSchemaInternal.prototype.productIcon = {
      type: String,
      required: false
    };

    /*
    	@property [Array<AircraftChecklistSectionSchemaInternal>] (Optional) The array of preflight sections.
    */


    AircraftChecklistSchemaInternal.prototype.preflight = {
      type: [AircraftChecklistSectionSchema],
      required: false
    };

    /*
    	@property [Array<AircraftChecklistSectionSchemaInternal>] (Optional) The array of takeoff sections.
    */


    AircraftChecklistSchemaInternal.prototype.takeoff = {
      type: [AircraftChecklistSectionSchema],
      required: false
    };

    /*
    	@property [Array<AircraftChecklistSectionSchemaInternal>] (Optional) The array of landing sections.
    */


    AircraftChecklistSchemaInternal.prototype.landing = {
      type: [AircraftChecklistSectionSchema],
      required: false
    };

    /*
    	@property [Array<AircraftChecklistSectionSchemaInternal>] (Optional) The array of emergency sections.
    */


    AircraftChecklistSchemaInternal.prototype.emergencies = {
      type: [AircraftChecklistSectionSchema],
      required: false
    };

    /*
    	@property [Boolean] (Required) A true/false value indicating whether this record has been deleted. Required for soft-delete support.
    */


    AircraftChecklistSchemaInternal.prototype.isDeleted = {
      type: Boolean,
      required: true,
      "default": false
    };

    return AircraftChecklistSchemaInternal;

  })();

  AircraftChecklistSchema = new Schema(new AircraftChecklistSchemaInternal());

  AircraftChecklistSchema.index({
    manufacturer: 1,
    model: 1,
    version: 1,
    tailNumber: 1,
    user: 1
  }, {
    unique: true
  });

  module.exports = AircraftChecklistSchema;

}).call(this);
