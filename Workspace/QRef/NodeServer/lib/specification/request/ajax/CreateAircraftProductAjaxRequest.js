(function() {
  var AjaxRequest, CreateAircraftProductAjaxRequest,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AjaxRequest = require('../../../serialization/AjaxRequest');

  /*
  Object sent as the body of an HTTP POST request to create a product.
  @author Nathan Klick
  @copyright QRef 2012
  */


  CreateAircraftProductAjaxRequest = (function(_super) {

    __extends(CreateAircraftProductAjaxRequest, _super);

    function CreateAircraftProductAjaxRequest() {
      return CreateAircraftProductAjaxRequest.__super__.constructor.apply(this, arguments);
    }

    /*
    	@property [String] (Required) A unique internal name for the product. Might possibly be a SKU or PN.
    */


    CreateAircraftProductAjaxRequest.prototype.name = {
      type: String,
      required: true
    };

    /*
    	@property [String] (Optional) A product description which will be visible on the product details screen.
    */


    CreateAircraftProductAjaxRequest.prototype.description = {
      type: String,
      required: false,
      "default": ''
    };

    /*
    	@property [Boolean] (Required) A true/false value indicating whether the product is published for consumer user.
    */


    CreateAircraftProductAjaxRequest.prototype.isPublished = {
      type: Boolean,
      required: true,
      "default": false
    };

    /*
    	@property [String] (Optional) An apple product code for the corresponding item in the iTunes store.
    */


    CreateAircraftProductAjaxRequest.prototype.appleProductIdentifier = {
      type: String,
      required: false
    };

    /*
    	@property [String] (Optional) A google product code for the corresponding item in the google play store.
    */


    CreateAircraftProductAjaxRequest.prototype.androidProductIdentifier = {
      type: String,
      required: false
    };

    /*
    	@property [Boolean] (Required) A true/false value indicating whether this product is available for apple devices.
    */


    CreateAircraftProductAjaxRequest.prototype.isAppleEnabled = {
      type: Boolean,
      required: true,
      "default": false
    };

    /*
    	@property [Boolean] (Required) A true/false value indicating whether this product is available for android devices.
    */


    CreateAircraftProductAjaxRequest.prototype.isAndroidEnabled = {
      type: Boolean,
      required: true,
      "default": false
    };

    /*
    	@property [Number] (Required) The suggested retail price for this product. Price may vary in iTunes and Google Play stores.
    */


    CreateAircraftProductAjaxRequest.prototype.suggestedRetailPrice = {
      type: Number,
      required: true,
      "default": 0,
      min: 0,
      max: 100.00
    };

    /*
    	@property [String] (Required) An enumeration indicating general product category. Valid values are ['aviation', 'marine', 'navigation'].
    */


    CreateAircraftProductAjaxRequest.prototype.productCategory = {
      type: String,
      required: true,
      "enum": ['aviation', 'marine', 'navigation']
    };

    /*
    	@property [String] (Required) An enumeration indicating the type of product. Valid values are ['checklist', 'manual', 'guide'].
    */


    CreateAircraftProductAjaxRequest.prototype.productType = {
      type: String,
      required: true,
      "enum": ['checklist', 'manual', 'guide']
    };

    /*
    	@property [ObjectId] (Optional) An associated base checklist for aircraft products. This category represents the stock checklist that the user receives when purchasing the product.
    */


    CreateAircraftProductAjaxRequest.prototype.aircraftChecklist = {
      type: ObjectId,
      ref: 'aircraft.checklists',
      required: false,
      "default": null
    };

    /*
    	@property [Boolean] (Required) A true/false value indicating whether this product is a sample product which is included with the application at no charge.
    */


    CreateAircraftProductAjaxRequest.prototype.isSampleProduct = {
      type: Boolean,
      required: true,
      "default": false
    };

    /*
    	@property [String] (Optional) An string indicating which aircraft, marine, or navigation serial numbers are supported by this product.
    */


    CreateAircraftProductAjaxRequest.prototype.serialNumber = {
      type: String,
      required: false,
      "default": null
    };

    /*
    	@property [ObjectId] (Required) The manufacturer associated with this product.
    	@see AircraftManufacturerSchemaInternal
    */


    CreateAircraftProductAjaxRequest.prototype.manufacturer = {
      type: ObjectId,
      ref: 'aircraft.manufacturers',
      required: true
    };

    /*
    	@property [ObjectId] (Required) The model associated with this product.
    	@see AircraftModelSchemaInternal
    */


    CreateAircraftProductAjaxRequest.prototype.model = {
      type: ObjectId,
      ref: 'aircraft.models',
      required: true
    };

    /*
    	@property [String] (Optional) A server-based relative path to the cover artwork for this product. This path should be relative to the server root.
    */


    CreateAircraftProductAjaxRequest.prototype.coverImage = {
      type: String,
      required: false
    };

    /*
    	@property [String] (Optional) A server-based relative path to the icon for this product. This path should be relative to the server root.
    */


    CreateAircraftProductAjaxRequest.prototype.productIcon = {
      type: String,
      required: false
    };

    return CreateAircraftProductAjaxRequest;

  })(AjaxRequest);

  module.exports = CreateAircraftProductAjaxRequest;

}).call(this);
