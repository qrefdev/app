mongoose = require('mongoose')
Schema = mongoose.Schema
ObjectId = Schema.ObjectId
AircraftChecklistItemSchema = require('./AircraftChecklistItemSchema')

AircraftChecklistSectionSchemaInternal = 
	sectionType:
		type: String
		required: true
		enum: ['standard', 'emergency']
	index:
		type: Number
		required: true
	name:
		type: String
		required: true
	items:
		type: [AircraftChecklistItemSchema]
		required: false
	sectionIcon:
		type: String
		required: false

AircraftChecklistSectionSchema = new Schema(AircraftChecklistSectionSchemaInternal)
module.exports = AircraftChecklistSectionSchema