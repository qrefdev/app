AjaxRoute = require('../../../AjaxRoute')
AjaxResponse = require('../../../../serialization/AjaxResponse')
UserAuth = require('../../../../security/UserAuth')
QRefDatabase = require('../../../../db/QRefDatabase')
class AircraftChecklistRoute extends AjaxRoute
	constructor: () ->
		super [{ method: 'POST', path: '/checklist/:checklistId' }, { method: 'GET', path: '/checklist/:checklistId' }]
	get: (req, res) =>
		if not @.isValidRequest(req)
			resp = new AjaxResponse()
			resp.failure('Bad Request', 400)
			res.json(resp, 200)
			return
		
		db = new QRefDatabase()
		token = req.param('token')
		checklistId = req.params.checklistId
		
		UserAuth.validateToken(token, (err, isTokenValid) ->
			if err? or not isTokenValid == true
				resp = new AjaxResponse()
				resp.failure('Not Authorized', 403)
				res.json(resp, 200)
				return
			
			# Validate Permissions Here
			
			query = db.AircraftChecklist.findById(checklistId) 
		
			query.exec((err, obj) ->
				if err?
					resp = new AjaxResponse()
					resp.failure('Internal Error', 500)
					res.json(resp, 200)
					return
					
				if obj?
					resp = new AjaxResponse()
					resp.addRecord(obj)
					resp.setTotal(1)
					res.json(resp, 200)
				else
					resp = new AjaxResponse()
					resp.failure('Not Found', 404)
					res.json(resp, 200)
				
			)
		)
	post: (req, res) =>
		if not @.isValidRequest(req)
			resp = new AjaxResponse()
			resp.failure('Bad Request', 400)
			res.json(resp, 200)
			return
		
		db = new QRefDatabase()
		token = req.param('token')
		checklistId = req.params.checklistId
		
		UserAuth.validateToken(token, (err, isTokenValid) ->
			if err? or not isTokenValid == true
				resp = new AjaxResponse()
				resp.failure('Not Authorized', 403)
				res.json(resp, 200)
				return
				
			# Validate Permissions Here
			
			query = db.AircraftChecklist.findById(checklistId)
			
			query.exec((err, obj) ->
				if err?
					resp = new AjaxResponse()
					resp.failure(err, 500)
					res.json(resp, 200)
					return
				
				if not obj?
					resp = new AjaxResponse()
					resp.failure('Not Found', 404)
					res.json(resp, 200)
					return
					
				obj.manufacturer = req.body.manufacturer
				obj.model = req.body.model
				obj.preflight = req.body.preflight
				obj.takeoff = req.body.takeoff
				obj.landing = req.body.landing
				obj.emergencies = req.body.emergenices
				
				if req.body?.version?
					obj.version = req.body.version
				
				if req.body?.productIcon?
					obj.productIcon = req.body.productIcon
				else 
					obj.productIcon = null
				
				if req.body?.coverImage?
					obj.coverImage = req.body.coverImage
				else
					obj.coverImage = null
					
				obj.save((err) ->
					if err?
						resp = new AjaxResponse()
						resp.failure(err, 500)
						res.json(resp, 200)
						return
					
					resp = new AjaxResponse()
					resp.addRecord(obj)
					resp.setTotal(1)
					res.json(resp, 200)
				)
			)
			
		)
		

	isValidRequest: (req) ->
		if (req.query? and req.query?.token? and req.params? and req.params?.checklistId?) or
			  (req.body? and req.body?.token? and req.params? and req.params?.checklistId? and req.body?.model? and  
			 	req.body?.manufacturer? and req.body?.preflight? and req.body?.takeoff? and
			 	req.body?.landing? and req.body?.emergencies? and
			 	req.body?.mode? and req.body.mode == 'ajax')
			true
		else
			false 
	
module.exports = new AircraftChecklistRoute()