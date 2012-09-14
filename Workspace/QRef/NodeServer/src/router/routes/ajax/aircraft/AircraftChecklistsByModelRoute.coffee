AjaxRoute = require('../../../AjaxRoute')
AjaxResponse = require('../../../../serialization/AjaxResponse')
UserAuth = require('../../../../security/UserAuth')
QRefDatabase = require('../../../../db/QRefDatabase')
###
Service route that allows the retrieval of all checklists for a given manufacturer and model.
@example Service Methods (see {CreateAircraftChecklistAjaxRequest})
  Request Format: application/json
  Response Format: application/json
  
  GET /services/ajax/aircraft/checklist/manufacturer/:manufacturerId/model/:modelId?token=:token
    :manufacturerId - (Required) The Id of a manufacturer.
    :modelId - (Required) The Id of a model.
    :token - (Required) A valid authentication token.
    
  Retrieves all checklists for the given manufacturer and model.
@author Nathan Klick
@copyright QRef 2012
###
class AircraftChecklistsByModelRoute extends AjaxRoute
	constructor: () ->
		super [{ method: 'POST', path: '/checklist/manufacturer/:manufacturerId/model/:modelId' }, { method: 'GET', path: '/checklist/manufacturer/:manufacturerId/model/:modelId' }]
	get: (req, res) =>
		if not @.isValidRequest(req)
			resp = new AjaxResponse()
			resp.failure('Bad Request', 400)
			res.json(resp, 200)
			return
		
		db = QRefDatabase.instance()
		token = req.param('token')
		mfg = req.params.manufacturerId
		mdl = req.params.modelId
		checklistId = req.params.checklistId
		
		UserAuth.validateToken(token, (err, isTokenValid) ->
			if err? or not isTokenValid == true
				resp = new AjaxResponse()
				resp.failure('Not Authorized', 403)
				res.json(resp, 200)
				return
			
			# Validate Permissions Here
			
			query = db.AircraftChecklist.find({ model : mdl, manufacturer : mfg, user: null, isDeleted: false })
		
			query.exec((err, arrObjs) ->
				if err?
					resp = new AjaxResponse()
					resp.failure('Internal Error', 500)
					res.json(resp, 200)
					return
					
				if arrObjs.length > 0
					resp = new AjaxResponse()
					resp.addRecords(arrObjs)
					resp.setTotal(arrObjs.length)
					res.json(resp, 200)
				else
					resp = new AjaxResponse()
					resp.failure('Not Found', 404)
					res.json(resp, 200)
				
			)
		)
	post: (req, res) =>
		resp = new AjaxResponse()
		resp.failure('Not Found', 404)
		res.json(resp, 200)
		return
	isValidRequest: (req) ->
		if (req.query? and req.query?.token? and req.params? and req.params?.modelId? and req.params?.manufacturerId?)
			true
		else
			false 
	
module.exports = new AircraftChecklistsByModelRoute()