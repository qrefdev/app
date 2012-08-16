mongoose = require('mongoose')
Schema = mongoose.Schema
ObjectId = Schema.ObjectId

AircraftManufacturerSchemaInternal = 
	name:
		type: String
		required: true
		unique: true
	description:
		type: String
		required: false
	models: [
		type: ObjectId
		ref: 'aircraft.models'
	]

AircraftManufacturerSchema = new Schema(AircraftManufacturerSchemaInternal)
module.exports = AircraftManufacturerSchema