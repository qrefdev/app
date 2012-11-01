AjaxRoute = require('../../../AjaxRoute')
AjaxResponse = require('../../../../serialization/AjaxResponse')
UserAuth = require('../../../../security/UserAuth')
QRefDatabase = require('../../../../db/QRefDatabase')
###
Service route that allows the retrieval of all models and the creation of new models.
@example Service Methods (see {CreateAircraftModelAjaxRequest})
  Request Format: application/json
  Response Format: application/json
  
  GET /services/ajax/aircraft/manufacturers?token=:token
    :token - (Required) A valid authentication token.
    
  Retrieves all models.
  
  POST /services/ajax/aircraft/manufacturers
  	@BODY - (Required) CreateAircraftManufacturerAjaxRequest
  	
  Creates a new aircraft model.
@author Nathan Klick
@copyright QRef 2012
###
class AircraftModelsByManufacturerRoute extends AjaxRoute
	constructor: () ->
		super [{ method: 'POST', path: '/manufacturer/:manufacturerId/models' }, { method: 'GET', path: '/manufacturer/:manufacturerId/models' }]
	get: (req, res) =>
		if not @.isValidRequest(req)
			resp = new AjaxResponse()
			resp.failure('Bad Request', 400)
			res.json(resp, 200)
			return
		
		db = QRefDatabase.instance()
		token = req.param('token')
		manufacturerId = req.params.manufacturerId
		
		UserAuth.validateToken(token, (err, isTokenValid) ->
			if err? or not isTokenValid == true
				resp = new AjaxResponse()
				resp.failure('Not Authorized', 403)
				res.json(resp, 200)
				return
			
			query = db.AircraftModel.find().where('manufacturer', manufacturerId)
		
			if req.query?.pageSize? and req.query?.page?
				query = query.skip(req.query.page * req.query.pageSize).limit(req.query.pageSize)
			else if req.query?.pageSize? and not req.query?.page?
				query = query.limit(req.query.pageSize)
			else if not req.query?.pageSize? and req.query?.page?
				query = query.skip(req.query.page * 25).limit(25)
			
			query.exec((err, arrObjs) ->
				if err?
					resp = new AjaxResponse()
					resp.failure('Internal Error', 500)
					res.json(resp, 200)
					return
					
				db.AircraftModel.find().where('manufacturer', manufacturerId).count((err, count) ->
					if err?
						resp = new AjaxResponse()
						resp.failure('Internal Error', 500)
						res.json(resp, 200)
						return
					
					resp = new AjaxResponse()
					resp.addRecords(arrObjs)
					resp.setTotal(count)
					res.json(resp, 200)
				)
				
			)
		)
	post: (req, res) =>
		resp = new AjaxResponse()
		resp.failure('Bad Request', 400)
		res.json(resp, 200)
		return
		

	isValidRequest: (req) ->
		if (req.query? and req.query?.token? and req.params?.manufacturerId?)
			true
		else
			false 
	
module.exports = new AircraftModelsByManufacturerRoute()