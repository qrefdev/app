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
	modelYear: 
		type: String
		required: true
	serialNumber: 
		type: String
		required: true
	tailNumber:
		type: String
		required: false
		default: null
	user:
		type: ObjectId
		ref: 'users'
		required: false
		default: null
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
		required: false
	takeoff:
		type: [AircraftChecklistSectionSchema]
		required: false
	landing: 
		type: [AircraftChecklistSectionSchema]
		required: false
	emergencies:
		type: [AircraftChecklistSectionSchema]
		required: false

AircraftChecklistSchema = new Schema(AircraftChecklistSchemaInternal)
AircraftChecklistSchema.index({ manufacturer: 1, model: 1, version: 1, modelYear: 1, serialNumber: 1 }, { unique: true })
module.exports = AircraftChecklistSchema