(function() {
  var AjaxRequest, CreateAircraftManufacturerAjaxRequest,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AjaxRequest = require('../../../serialization/AjaxRequest');

  /*
  Object sent as the body of an HTTP POST request to create a manufacturer.
  @author Nathan Klick
  @copyright QRef 2012
  */


  CreateAircraftManufacturerAjaxRequest = (function(_super) {

    __extends(CreateAircraftManufacturerAjaxRequest, _super);

    function CreateAircraftManufacturerAjaxRequest() {
      return CreateAircraftManufacturerAjaxRequest.__super__.constructor.apply(this, arguments);
    }

    /*
    	@property [String] (Required) The name of the manufacturer.
    */


    CreateAircraftManufacturerAjaxRequest.prototype.name = {
      type: String,
      required: true,
      unique: true
    };

    /*
    	@property [String] (Optional) A detailed description of this manufacturer.
    */


    CreateAircraftManufacturerAjaxRequest.prototype.description = {
      type: String,
      required: false
    };

    return CreateAircraftManufacturerAjaxRequest;

  })(AjaxRequest);

  module.exports = CreateAircraftManufacturerAjaxRequest;

}).call(this);
