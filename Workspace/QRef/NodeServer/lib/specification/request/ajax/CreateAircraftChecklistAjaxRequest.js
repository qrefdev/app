(function() {
  var AjaxRequest, CreateAircraftChecklistAjaxRequest,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AjaxRequest = require('../../../serialization/AjaxRequest');

  /*
  Object sent as the body of an HTTP POST request to create a checklist.
  @author Nathan Klick
  @copyright QRef 2012
  */


  CreateAircraftChecklistAjaxRequest = (function(_super) {

    __extends(CreateAircraftChecklistAjaxRequest, _super);

    function CreateAircraftChecklistAjaxRequest() {
      return CreateAircraftChecklistAjaxRequest.__super__.constructor.apply(this, arguments);
    }

    /*
    	@property [ObjectId] (Required) The manufacturer that this checklist is built against.
    	@see AircraftManufacturerSchemaInternal
    */


    CreateAircraftChecklistAjaxRequest.prototype.manufacturer = {
      type: ObjectId,
      ref: 'aircraft.manufacturers',
      required: true
    };

    /*
    	@property [ObjectId] (Required) The model that this checklist is built against.
    	@see AircraftModelSchemaInternal
    */


    CreateAircraftChecklistAjaxRequest.prototype.model = {
      type: ObjectId,
      ref: 'aircraft.models',
      required: true
    };

    /*
    	@property [Number] (Optional) The order in which this checklist should appear relative to the other checklists.
    */


    CreateAircraftChecklistAjaxRequest.prototype.index = {
      type: Number,
      required: false,
      "default": null
    };

    /*
    	@property [String] (Optional) The tail number for a list which has been customized to a specific plane.
    */


    CreateAircraftChecklistAjaxRequest.prototype.tailNumber = {
      type: String,
      required: false,
      "default": null
    };

    /*
    	@property [ObjectId] (Optional) The user which owns this customized version of the checklist.
    	@see UserSchemaInternal
    */


    CreateAircraftChecklistAjaxRequest.prototype.user = {
      type: ObjectId,
      ref: 'users',
      required: false,
      "default": null
    };

    /*
    	@property [Number] (Optional) The version number of this checklist.
    */


    CreateAircraftChecklistAjaxRequest.prototype.version = {
      type: Number,
      required: true,
      "default": 1
    };

    /*
    	@property [String] (Optional) A server-based relative path to the product icon. This path should be relative to the server root.
    */


    CreateAircraftChecklistAjaxRequest.prototype.productIcon = {
      type: String,
      required: false
    };

    /*
    	@property [Array<AircraftChecklistSectionSchemaInternal>] (Optional) The array of preflight sections.
    */


    CreateAircraftChecklistAjaxRequest.prototype.preflight = {
      type: [AircraftChecklistSectionSchema],
      required: false
    };

    /*
    	@property [Array<AircraftChecklistSectionSchemaInternal>] (Optional) The array of takeoff sections.
    */


    CreateAircraftChecklistAjaxRequest.prototype.takeoff = {
      type: [AircraftChecklistSectionSchema],
      required: false
    };

    /*
    	@property [Array<AircraftChecklistSectionSchemaInternal>] (Optional) The array of landing sections.
    */


    CreateAircraftChecklistAjaxRequest.prototype.landing = {
      type: [AircraftChecklistSectionSchema],
      required: false
    };

    /*
    	@property [Array<AircraftChecklistSectionSchemaInternal>] (Optional) The array of emergency sections.
    */


    CreateAircraftChecklistAjaxRequest.prototype.emergencies = {
      type: [AircraftChecklistSectionSchema],
      required: false
    };

    /*
    	@property [Boolean] (Optional) A true/false value indicating whether this record has been deleted. Required for soft-delete support.
    */


    CreateAircraftChecklistAjaxRequest.prototype.isDeleted = {
      type: Boolean,
      required: true,
      "default": false
    };

    return CreateAircraftChecklistAjaxRequest;

  })(AjaxRequest);

  module.exports = CreateAircraftChecklistAjaxRequest;

}).call(this);
