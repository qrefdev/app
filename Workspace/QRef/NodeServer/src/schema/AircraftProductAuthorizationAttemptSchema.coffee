mongoose = require('mongoose')
Schema = mongoose.Schema
ObjectId = Schema.ObjectId
Mixed = Schema.Types.Mixed
###
Schema representing a specific aircraft make and model. 
@example MongoDB Collection
  db.aircraft.models
@example MongoDB Indexes
  db.aircraft.models.ensureIndex({ name: 1, modelYear: 1 }, { unique: true })
@author Nathan Klick
@copyright QRef 2012
@abstract
###
class AircraftProductAuthorizationAttemptSchemaInternal
	user: 
		type: ObjectId
		required: true
		ref: 'users'
	product:
		type: ObjectId
		required: true
		ref: 'products'
	attemptType:
		type: String
		required: true
		enum: ['apple', 'android']
	isReceiptValid:
		type: Boolean
		required: true
		default: false
	isComplete:
		type: Boolean
		required: true
		default: false
	appleReceiptHash:
		type: String
		required: false
		default: null
	appleReceipt:
		type: Mixed
		required: false
		default: null
	androidReceiptHash:
		type: String
		required: false
		default: null
	androidReceipt:
		type: Mixed
		required: false
		default: null
	checklist:
		type: ObjectId
		required: false
		default: null
		ref: 'aircraft.checklists'

AircraftProductAuthorizationAttemptSchema = new Schema(new AircraftProductAuthorizationAttemptSchemaInternal())
AircraftProductAuthorizationAttemptSchema.index({ user: 1, product: 1 })
module.exports = AircraftProductAuthorizationAttemptSchema