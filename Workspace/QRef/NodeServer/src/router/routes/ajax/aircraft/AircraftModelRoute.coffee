AjaxRoute = require('../../../AjaxRoute')
AjaxResponse = require('../../../../serialization/AjaxResponse')
UserAuth = require('../../../../security/UserAuth')
QRefDatabase = require('../../../../db/QRefDatabase')
###
Service route that allows the retrieval of all manufacturers and the creation of new manufacturers.
@example Service Methods (see {CreateAircraftManufacturerAjaxRequest})
  Request Format: application/json
  Response Format: application/json
  
  POST /services/ajax/aircraft/manufacturers
  	@BODY - (Required) CreateAircraftManufacturerAjaxRequest
  	
  Updates an existing model
@author Nathan Klick
@copyright QRef 2012
###
class AircraftModelRoute extends AjaxRoute
	constructor: () ->
		super [{ method: 'POST', path: '/model' }, { method: 'GET', path: '/model' }]
	post: (req, res) =>
		if not @.isValidRequest(req)
			resp = new AjaxResponse()
			resp.failure('Bad Request', 400)
			res.json(resp, 200)
			return
		
		db = QRefDatabase.instance()
		token = req.param('token')
		modelId = req.body.id
		
		UserAuth.validateToken(token, (err, isTokenValid) =>
			if err? or not isTokenValid == true
				resp = new AjaxResponse()
				resp.failure('Not Authorized', 403)
				res.json(resp, 200)
				return
			
			UserAuth.isInAnyRole(token, ['Administrators'], (err, success) =>
				if err?
					resp = new AjaxResponse()
					resp.failure(err, 403)
					res.json(resp, 200)
					return
					
				if success
					@.getModel(modelId, (err, model) =>
						if err?
							resp = new AjaxResponse()
							resp.failure(err, 403)
							res.json(resp, 200)
							return
							
						model.name = req.body.name
						model.description = req.body.description
						model.modelYear = req.body.year
						
						model.save((err) =>
							if err?
								resp = new AjaxResponse()
								resp.failure(err, 403)
								res.json(resp, 200)
								return
							
							resp = new AjaxResponse();
							resp.addRecords([model])
							res.json(resp, 200)
							return
						)
					)
				else
					resp = new AjaxResponse()
					resp.failure('You do not have the proper permissions')
					res.json(resp, 200)
					return
			)
		)
		
	getModel: (id, callback) =>
		db = QrefDatabase.instance()
		
		db.AircraftModel.findOne({ _id: id}, (err, model) => 
			if err?
				callback(err, null)
				return
			
			if model?
				callback(null, model)
				return
			else
				callback(new Error('No model found for that id'), null)
				return
		)
	
	isValidRequest: (req) ->
		if (req.query? and req.query?.token?) or
			 (req.body? and req.body?.token? and req.body?.mode? and req.body.mode == 'ajax' && req.body?.id? && req.body?.name? && req.body?.description? && req.body?.year?)
			true
		else
			false 
	
module.exports = new AircraftModelRoute()