(function() {
  var ObjectId, ProductSchema, ProductSchemaInternal, Schema, mongoose;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  ObjectId = Schema.ObjectId;

  /*
  Schema representing a saleable product. The product record is used in conjunction with the In-App Purchase Processes.
  @example MongoDB Collection
    db.products
  @example MongoDB Indexes
    db.products.ensureIndex({ name: 1 }, { unique: true })
    db.products.ensureIndex({ manufacturer: 1, model: 1 })
  @author Nathan Klick
  @copyright QRef 2012
  @abstract
  */


  ProductSchemaInternal = (function() {

    function ProductSchemaInternal() {}

    /*
    	@property [String] (Required) A unique internal name for the product. Might possibly be a SKU or PN.
    */


    ProductSchemaInternal.prototype.name = {
      type: String,
      required: true
    };

    /*
    	@property [String] (Optional) A product description which will be visible on the product details screen.
    */


    ProductSchemaInternal.prototype.description = {
      type: String,
      required: false,
      "default": ''
    };

    /*
    	@property [Boolean] (Required) A true/false value indicating whether the product is published for consumer user.
    */


    ProductSchemaInternal.prototype.isPublished = {
      type: Boolean,
      required: true,
      "default": false
    };

    /*
    	@property [String] (Optional) An apple product code for the corresponding item in the iTunes store.
    */


    ProductSchemaInternal.prototype.appleProductIdentifier = {
      type: String,
      required: false
    };

    /*
    	@property [String] (Optional) A google product code for the corresponding item in the google play store.
    */


    ProductSchemaInternal.prototype.androidProductIdentifier = {
      type: String,
      required: false
    };

    /*
    	@property [Boolean] (Required) A true/false value indicating whether this product is available for apple devices.
    */


    ProductSchemaInternal.prototype.isAppleEnabled = {
      type: Boolean,
      required: true,
      "default": false
    };

    /*
    	@property [Boolean] (Required) A true/false value indicating whether this product is available for android devices.
    */


    ProductSchemaInternal.prototype.isAndroidEnabled = {
      type: Boolean,
      required: true,
      "default": false
    };

    /*
    	@property [Number] (Required) The suggested retail price for this product. Price may vary in iTunes and Google Play stores.
    */


    ProductSchemaInternal.prototype.suggestedRetailPrice = {
      type: Number,
      required: true,
      "default": 0,
      min: 0,
      max: 100.00
    };

    /*
    	@property [String] (Required) An enumeration indicating general product category. Valid values are ['aviation', 'marine', 'navigation'].
    */


    ProductSchemaInternal.prototype.productCategory = {
      type: String,
      required: true,
      "enum": ['aviation', 'marine', 'navigation']
    };

    /*
    	@property [String] (Required) An enumeration indicating the type of product. Valid values are ['checklist', 'manual', 'guide'].
    */


    ProductSchemaInternal.prototype.productType = {
      type: String,
      required: true,
      "enum": ['checklist', 'manual', 'guide']
    };

    /*
    	@property [ObjectId] (Optional) An associated base checklist for aircraft products. This category represents the stock checklist that the user receives when purchasing the product.
    */


    ProductSchemaInternal.prototype.aircraftChecklist = {
      type: ObjectId,
      ref: 'aircraft.checklists',
      required: false,
      "default": null
    };

    /*
    	@property [Boolean] (Required) A true/false value indicating whether this product is a sample product which is included with the application at no charge.
    */


    ProductSchemaInternal.prototype.isSampleProduct = {
      type: Boolean,
      required: true,
      "default": false
    };

    /*
    	@property [String] (Optional) An string indicating which aircraft, marine, or navigation serial numbers are supported by this product.
    */


    ProductSchemaInternal.prototype.serialNumber = {
      type: String,
      required: false,
      "default": null
    };

    /*
    	@property [ObjectId] (Required) The manufacturer associated with this product.
    	@see AircraftManufacturerSchemaInternal
    */


    ProductSchemaInternal.prototype.manufacturer = {
      type: ObjectId,
      ref: 'aircraft.manufacturers',
      required: true
    };

    /*
    	@property [ObjectId] (Required) The model associated with this product.
    	@see AircraftModelSchemaInternal
    */


    ProductSchemaInternal.prototype.model = {
      type: ObjectId,
      ref: 'aircraft.models',
      required: true
    };

    /*
    	@property [String] (Optional) A server-based relative path to the cover artwork for this product. This path should be relative to the server root.
    */


    ProductSchemaInternal.prototype.coverImage = {
      type: String,
      required: false
    };

    /*
    	@property [String] (Optional) A server-based relative path to the icon for this product. This path should be relative to the server root.
    */


    ProductSchemaInternal.prototype.productIcon = {
      type: String,
      required: false
    };

    return ProductSchemaInternal;

  })();

  ProductSchema = new Schema(new ProductSchemaInternal());

  ProductSchema.index({
    manufacturer: 1,
    model: 1
  });

  ProductSchema.index({
    name: 1
  }, {
    unique: true
  });

  module.exports = ProductSchema;

}).call(this);
