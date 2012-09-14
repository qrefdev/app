AjaxRequest = require('../../../serialization/AjaxRequest')
###
Object sent as the body of an HTTP POST request to create a checklist.
@author Nathan Klick
@copyright QRef 2012
###
class CreateAircraftChecklistAjaxRequest extends AjaxRequest
	###
	@property [ObjectId] (Required) The manufacturer that this checklist is built against.
	@see AircraftManufacturerSchemaInternal
	###
	manufacturer: 
		type: ObjectId
		ref: 'aircraft.manufacturers'
		required: true
	###
	@property [ObjectId] (Required) The model that this checklist is built against.
	@see AircraftModelSchemaInternal
	###
	model: 
		type: ObjectId
		ref: 'aircraft.models'
		required: true
	###
	@property [Number] (Optional) The order in which this checklist should appear relative to the other checklists.
	###
	index: 
		type: Number
		required: false
		default: null
	###
	@property [String] (Optional) The tail number for a list which has been customized to a specific plane.
	###
	tailNumber:
		type: String
		required: false
		default: null
	###
	@property [ObjectId] (Optional) The user which owns this customized version of the checklist.
	@see UserSchemaInternal
	###
	user:
		type: ObjectId
		ref: 'users'
		required: false
		default: null
	###
	@property [Number] (Optional) The version number of this checklist. 
	###
	version:
		type: Number
		required: true
		default: 1
	###
	@property [String] (Optional) A server-based relative path to the product icon. This path should be relative to the server root.
	###
	productIcon:
		type: String
		required: false
	###
	@property [Array<AircraftChecklistSectionSchemaInternal>] (Optional) The array of preflight sections.
	###
	preflight:
		type: [AircraftChecklistSectionSchema]
		required: false
	###
	@property [Array<AircraftChecklistSectionSchemaInternal>] (Optional) The array of takeoff sections.
	###
	takeoff:
		type: [AircraftChecklistSectionSchema]
		required: false
	###
	@property [Array<AircraftChecklistSectionSchemaInternal>] (Optional) The array of landing sections.
	###
	landing: 
		type: [AircraftChecklistSectionSchema]
		required: false
	###
	@property [Array<AircraftChecklistSectionSchemaInternal>] (Optional) The array of emergency sections.
	###
	emergencies:
		type: [AircraftChecklistSectionSchema]
		required: false
	###
	@property [Boolean] (Optional) A true/false value indicating whether this record has been deleted. Required for soft-delete support.
	###
	isDeleted:
		type: Boolean
		required: true
		default: false 
module.exports = CreateAircraftChecklistAjaxRequest