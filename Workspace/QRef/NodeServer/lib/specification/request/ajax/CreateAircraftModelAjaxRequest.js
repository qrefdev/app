(function() {
  var AjaxRequest, CreateAircraftModelAjaxRequest,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AjaxRequest = require('../../../serialization/AjaxRequest');

  /*
  Object sent as the body of an HTTP POST request to create a model.
  @author Nathan Klick
  @copyright QRef 2012
  */


  CreateAircraftModelAjaxRequest = (function(_super) {

    __extends(CreateAircraftModelAjaxRequest, _super);

    function CreateAircraftModelAjaxRequest() {
      return CreateAircraftModelAjaxRequest.__super__.constructor.apply(this, arguments);
    }

    /*
    	@property [String] (Required) The name of the model.
    */


    CreateAircraftModelAjaxRequest.prototype.name = {
      type: String,
      required: true
    };

    /*
    	@property [String] (Optional) A detailed description of the model.
    */


    CreateAircraftModelAjaxRequest.prototype.description = {
      type: String,
      required: false
    };

    /*
    	@property [ObjectId] (Required) The associated manufacturer of this model.
    	@see AircraftManufacturerSchemaInternal
    */


    CreateAircraftModelAjaxRequest.prototype.manufacturer = {
      type: ObjectId,
      required: true,
      ref: 'aircraft.manufacturers'
    };

    /*
    	@property [String] (Required) A string representing the specific year of this model.
    */


    CreateAircraftModelAjaxRequest.prototype.modelYear = {
      type: String,
      required: true
    };

    return CreateAircraftModelAjaxRequest;

  })(AjaxRequest);

  module.exports = CreateAircraftModelAjaxRequest;

}).call(this);
