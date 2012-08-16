mongoose = require('mongoose')
Schema = mongoose.Schema
ObjectId = Schema.ObjectId

ProductSchemaInternal = 
	name:
		type: String
		required: true
	isPublished:
		type: Boolean
		required: true
		default: false
	appleProductIdentifier:
		type: String
		required: false
	androidProductIdentifier:
		type: String
		required: false
	isAppleEnabled:
		type: Boolean
		required: true
		default: false
	isAndroidEnabled:
		type: Boolean
		required: true
		default: false
	suggestedRetailPrice:
		type: Number
		required: true
		default: 0
		min: 0
		max: 100.00
	productCategory:
		type: String
		required: true
		enum: ['aviation', 'marine', 'navigation']
	productType:
		type: String
		required: true
		enum: ['checklist', 'manual', 'guide']
	aircraftChecklist:
		type: ObjectId
		ref: 'aircraft.checklists'
		required: false
		default: null
	
	
ProductSchema = new Schema(ProductSchemaInternal)
module.exports = ProductSchema