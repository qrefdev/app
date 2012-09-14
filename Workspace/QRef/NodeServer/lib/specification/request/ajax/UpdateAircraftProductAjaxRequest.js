(function() {
  var AjaxRequest, UpdateAircraftProductAjaxRequest,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AjaxRequest = require('../../../serialization/AjaxRequest');

  /*
  Object sent as the body of an HTTP POST request to update a product.
  @author Nathan Klick
  @copyright QRef 2012
  */


  UpdateAircraftProductAjaxRequest = (function(_super) {

    __extends(UpdateAircraftProductAjaxRequest, _super);

    function UpdateAircraftProductAjaxRequest() {
      return UpdateAircraftProductAjaxRequest.__super__.constructor.apply(this, arguments);
    }

    /*
    	@property [String] (Optional) A unique internal name for the product. Might possibly be a SKU or PN.
    */


    UpdateAircraftProductAjaxRequest.prototype.name = {
      type: String,
      required: true
    };

    /*
    	@property [String] (Optional) A product description which will be visible on the product details screen.
    */


    UpdateAircraftProductAjaxRequest.prototype.description = {
      type: String,
      required: false,
      "default": ''
    };

    /*
    	@property [Boolean] (Optional) A true/false value indicating whether the product is published for consumer user.
    */


    UpdateAircraftProductAjaxRequest.prototype.isPublished = {
      type: Boolean,
      required: true,
      "default": false
    };

    /*
    	@property [String] (Optional) An apple product code for the corresponding item in the iTunes store.
    */


    UpdateAircraftProductAjaxRequest.prototype.appleProductIdentifier = {
      type: String,
      required: false
    };

    /*
    	@property [String] (Optional) A google product code for the corresponding item in the google play store.
    */


    UpdateAircraftProductAjaxRequest.prototype.androidProductIdentifier = {
      type: String,
      required: false
    };

    /*
    	@property [Boolean] (Optional) A true/false value indicating whether this product is available for apple devices.
    */


    UpdateAircraftProductAjaxRequest.prototype.isAppleEnabled = {
      type: Boolean,
      required: true,
      "default": false
    };

    /*
    	@property [Boolean] (Optional) A true/false value indicating whether this product is available for android devices.
    */


    UpdateAircraftProductAjaxRequest.prototype.isAndroidEnabled = {
      type: Boolean,
      required: true,
      "default": false
    };

    /*
    	@property [Number] (Optional) The suggested retail price for this product. Price may vary in iTunes and Google Play stores.
    */


    UpdateAircraftProductAjaxRequest.prototype.suggestedRetailPrice = {
      type: Number,
      required: true,
      "default": 0,
      min: 0,
      max: 100.00
    };

    /*
    	@property [String] (Optional) An enumeration indicating general product category. Valid values are ['aviation', 'marine', 'navigation'].
    */


    UpdateAircraftProductAjaxRequest.prototype.productCategory = {
      type: String,
      required: true,
      "enum": ['aviation', 'marine', 'navigation']
    };

    /*
    	@property [String] (Optional) An enumeration indicating the type of product. Valid values are ['checklist', 'manual', 'guide'].
    */


    UpdateAircraftProductAjaxRequest.prototype.productType = {
      type: String,
      required: true,
      "enum": ['checklist', 'manual', 'guide']
    };

    /*
    	@property [ObjectId] (Optional) An associated base checklist for aircraft products. This category represents the stock checklist that the user receives when purchasing the product.
    */


    UpdateAircraftProductAjaxRequest.prototype.aircraftChecklist = {
      type: ObjectId,
      ref: 'aircraft.checklists',
      required: false,
      "default": null
    };

    /*
    	@property [Boolean] (Optional) A true/false value indicating whether this product is a sample product which is included with the application at no charge.
    */


    UpdateAircraftProductAjaxRequest.prototype.isSampleProduct = {
      type: Boolean,
      required: true,
      "default": false
    };

    /*
    	@property [String] (Optional) An string indicating which aircraft, marine, or navigation serial numbers are supported by this product.
    */


    UpdateAircraftProductAjaxRequest.prototype.serialNumber = {
      type: String,
      required: false,
      "default": null
    };

    /*
    	@property [ObjectId] (Optional) The manufacturer associated with this product.
    	@see AircraftManufacturerSchemaInternal
    */


    UpdateAircraftProductAjaxRequest.prototype.manufacturer = {
      type: ObjectId,
      ref: 'aircraft.manufacturers',
      required: true
    };

    /*
    	@property [ObjectId] (Optional) The model associated with this product.
    	@see AircraftModelSchemaInternal
    */


    UpdateAircraftProductAjaxRequest.prototype.model = {
      type: ObjectId,
      ref: 'aircraft.models',
      required: true
    };

    /*
    	@property [String] (Optional) A server-based relative path to the cover artwork for this product. This path should be relative to the server root.
    */


    UpdateAircraftProductAjaxRequest.prototype.coverImage = {
      type: String,
      required: false
    };

    /*
    	@property [String] (Optional) A server-based relative path to the icon for this product. This path should be relative to the server root.
    */


    UpdateAircraftProductAjaxRequest.prototype.productIcon = {
      type: String,
      required: false
    };

    return UpdateAircraftProductAjaxRequest;

  })(AjaxRequest);

  module.exports = CreateAircraftProductAjaxRequest;

}).call(this);
