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
  	
  Updates an existing manufacturer
@author Nathan Klick
@copyright QRef 2012
###
class AircraftManufacturerRoute extends AjaxRoute
	constructor: () ->
		super [{ method: 'POST', path: '/manufacturer' }, { method: 'GET', path: '/manufacturer' }]
	post: (req, res) =>
		if not @.isValidRequest(req)
			resp = new AjaxResponse()
			resp.failure('Bad Request', 400)
			res.json(resp, 200)
			return
		
		db = QRefDatabase.instance()
		token = req.param('token')
		manufacturerId = req.body.id
		
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
					@.getManufacturer(manufacturerId, (err, manufacturer) =>
						if err?
							resp = new AjaxResponse()
							resp.failure(err, 403)
							res.json(resp, 200)
							return
							
						manufacturer.name = req.body.name
						manufacturer.description = req.body.description
						
						manufacturer.save((err) =>
							if err?
								resp = new AjaxResponse()
								resp.failure(err, 403)
								res.json(resp, 200)
								return
							
							resp = new AjaxResponse();
							resp.addRecords([manufacturer])
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
		
	getManufacturer: (id, callback) =>
		db = QRefDatabase.instance()
		
		db.AircraftManufacturer.findOne({ _id: id}, (err, manufacturer) => 
			if err?
				callback(err, null)
				return
			
			if manufacturer?
				callback(null, manufacturer)
				return
			else
				callback(new Error('No manufacturer found for that id'), null)
				return
		)
	
	isValidRequest: (req) ->
		if (req.query? and req.query?.token?) or
			 (req.body? and req.body?.token? and req.body?.mode? and req.body.mode == 'ajax' && req.body?.id? && req.body?.name? && req.body?.description?)
			true
		else
			false 
	
module.exports = new AircraftManufacturerRoute()