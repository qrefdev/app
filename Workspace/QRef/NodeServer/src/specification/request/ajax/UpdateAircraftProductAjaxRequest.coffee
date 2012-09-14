AjaxRequest = require('../../../serialization/AjaxRequest')
###
Object sent as the body of an HTTP POST request to update a product.
@author Nathan Klick
@copyright QRef 2012
###
class UpdateAircraftProductAjaxRequest extends AjaxRequest
	###
	@property [String] (Optional) A unique internal name for the product. Might possibly be a SKU or PN.
	###
	name:
		type: String
		required: true
	###
	@property [String] (Optional) A product description which will be visible on the product details screen.
	###
	description: 
		type: String
		required: false
		default: ''
	###
	@property [Boolean] (Optional) A true/false value indicating whether the product is published for consumer user.
	###
	isPublished:
		type: Boolean
		required: true
		default: false
	###
	@property [String] (Optional) An apple product code for the corresponding item in the iTunes store.
	###
	appleProductIdentifier:
		type: String
		required: false
	###
	@property [String] (Optional) A google product code for the corresponding item in the google play store.
	###
	androidProductIdentifier:
		type: String
		required: false
	###
	@property [Boolean] (Optional) A true/false value indicating whether this product is available for apple devices.
	###
	isAppleEnabled:
		type: Boolean
		required: true
		default: false
	###
	@property [Boolean] (Optional) A true/false value indicating whether this product is available for android devices.
	###
	isAndroidEnabled:
		type: Boolean
		required: true
		default: false
	###
	@property [Number] (Optional) The suggested retail price for this product. Price may vary in iTunes and Google Play stores.
	###
	suggestedRetailPrice:
		type: Number
		required: true
		default: 0
		min: 0
		max: 100.00
	###
	@property [String] (Optional) An enumeration indicating general product category. Valid values are ['aviation', 'marine', 'navigation'].
	###
	productCategory:
		type: String
		required: true
		enum: ['aviation', 'marine', 'navigation']
	###
	@property [String] (Optional) An enumeration indicating the type of product. Valid values are ['checklist', 'manual', 'guide'].
	###
	productType:
		type: String
		required: true
		enum: ['checklist', 'manual', 'guide']
	###
	@property [ObjectId] (Optional) An associated base checklist for aircraft products. This category represents the stock checklist that the user receives when purchasing the product.
	###
	aircraftChecklist:
		type: ObjectId
		ref: 'aircraft.checklists'
		required: false
		default: null
	###
	@property [Boolean] (Optional) A true/false value indicating whether this product is a sample product which is included with the application at no charge.
	###
	isSampleProduct:
		type: Boolean
		required: true
		default: false
	###
	@property [String] (Optional) An string indicating which aircraft, marine, or navigation serial numbers are supported by this product.
	###
	serialNumber: 
		type: String
		required: false
		default: null
	###
	@property [ObjectId] (Optional) The manufacturer associated with this product.
	@see AircraftManufacturerSchemaInternal
	###
	manufacturer: 
		type: ObjectId
		ref: 'aircraft.manufacturers'
		required: true
	###
	@property [ObjectId] (Optional) The model associated with this product.
	@see AircraftModelSchemaInternal
	###
	model: 
		type: ObjectId
		ref: 'aircraft.models'
		required: true
	###
	@property [String] (Optional) A server-based relative path to the cover artwork for this product. This path should be relative to the server root. 
	###
	coverImage:
		type: String
		required: false
	###
	@property [String] (Optional) A server-based relative path to the icon for this product. This path should be relative to the server root.
	###
	productIcon:
		type: String
		required: false
module.exports = CreateAircraftProductAjaxRequest