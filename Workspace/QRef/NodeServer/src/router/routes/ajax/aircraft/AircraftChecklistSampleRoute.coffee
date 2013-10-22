AjaxRoute = require('../../../AjaxRoute')
AjaxResponse = require('../../../../serialization/AjaxResponse')
UserAuth = require('../../../../security/UserAuth')
QRefDatabase = require('../../../../db/QRefDatabase')
ChecklistManager = require('../../../../db/manager/ChecklistManager')
AircraftChecklistFilter = require('../../../../security/filters/AircraftChecklistFilter')
###
Service route that allows the retrieval and updation of an individual checklist.
@example Service Methods (see {UpdateAircraftChecklistAjaxRequest})
  Request Format: application/json
  Response Format: application/json

  GET /services/ajax/aircraft/checklist/:checklistId
    :checklistId - (Required) The ID of the checklist you wish to retrieve
    
    This method retrieves an individual checklist.
    
  POST /services/ajax/aircraft/checklist/:checklistId
  	:checklistId - (Required) The ID of the checklist you wish to update
  	@BODY - (Required) UpdateAircraftChecklistAjaxRequest
  	
  	This method performs an update on a single checklist.
@author Nathan Klick
@copyright QRef 2012
###
class AircraftChecklistSampleRoute extends AjaxRoute
	constructor: () ->
		super [{ method: 'GET', path: '/checklist-sample' }]
	get: (req, res) =>
		db = QRefDatabase.instance();
		
		db.Product
			.where('productCategory')
			.equals('aviation')
			.where('isSampleProduct')
			.equals(true)
			.where('isDeleted')
			.equals(false)
			.findOne((err, product) =>
				if err?
					resp = new AjaxResponse()
					resp.failure('Internal Error', 500)
					res.json(resp, 200)
					return
					
				if product?
					db.AircraftChecklist
						.where('_id')
						.equals(product.aircraftChecklist)
						.populate('manufacturer model')
						.findOne((er, checklist) =>
							if er?
								resp = new AjaxResponse()
								resp.failure('Internal Error', 500)
								res.json(resp, 200)
								return
								
							if checklist?
								checklistObj = checklist.toObject()
								resp = new AjaxResponse()
								resp.addRecord(checklistObj)
								resp.setTotal(1)
								res.json(resp, 200)
								return
							else
								resp = new AjaxResponse()
								resp.failure('Internal Error', 500)
								res.json(resp, 200)
								return
						)
				else
					resp = new AjaxResponse()
					resp.failure('Internal Error', 500)
					res.json(resp, 200)
					return
			)
	
module.exports = new AircraftChecklistSampleRoute()