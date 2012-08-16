mongoose = require('mongoose')
Schema = mongoose.Schema
ObjectId = Schema.ObjectId
AircraftChecklistSectionSchema = require('./AircraftChecklistSectionSchema')

AircraftChecklistSchemaInternal = 
	manufacturer: 
		type: ObjectId
		ref: 'aircraft.manufacturers'
		required: true
	model: 
		type: ObjectId
		ref: 'aircraft.models'
		required: true
	version:
		type: Number
		required: true
		default: 1
	productIcon:
		type: String
		required: false
	coverImage:
		type: String
		required: false
	preflight:
		type: [AircraftChecklistSectionSchema]
		required: true
	takeoff:
		type: [AircraftChecklistSectionSchema]
		required: true
	landing: 
		type: [AircraftChecklistSectionSchema]
		required: true
	emergencies:
		type: [AircraftChecklistSectionSchema]
		required: true

AircraftChecklistSchema = new Schema(AircraftChecklistSchemaInternal)
AircraftChecklistSchema.index({ manufacturer: 1, model: 1, version: 1 }, { unique: true })
module.exports = AircraftChecklistSchema