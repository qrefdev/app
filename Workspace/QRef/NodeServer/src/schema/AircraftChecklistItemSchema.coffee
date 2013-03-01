mongoose = require('mongoose')
Schema = mongoose.Schema
ObjectId = Schema.ObjectId

###
Nested Schema representing a specific checklist item. 
@note This is a nested document and does not have a separate Mongo collection.
@note No indexes are defined because this is nested document. 
@author Nathan Klick
@copyright QRef 2012
@abstract
###
class AircraftChecklistItemSchemaInternal
	###
	@property [String] (Required) relative path to the image from the root of the server
	### 
	icon:
		type: String
		required: false
	###
	@property [Number] (Required) a numerical index indicating the order of the element
	###
	index:
		type: Number
		required: true
	###
	@property [String] (Required) the item's check value
	###
	check: 
		type: String
		required: false
	###
	@property [String] (Required) the item's response value
	### 
	response:
		type: String
		required: false

AircraftChecklistItemSchema = new Schema(new AircraftChecklistItemSchemaInternal())
module.exports = AircraftChecklistItemSchema