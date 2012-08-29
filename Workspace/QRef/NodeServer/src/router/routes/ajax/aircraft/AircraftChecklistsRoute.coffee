AjaxRoute = require('../../../AjaxRoute')
AjaxResponse = require('../../../../serialization/AjaxResponse')
UserAuth = require('../../../../security/UserAuth')
QRefDatabase = require('../../../../db/QRefDatabase')
class AircraftChecklistsRoute extends AjaxRoute
	constructor: () ->
		super [{ method: 'POST', path: '/checklists' }, { method: 'GET', path: '/checklists' }]
	get: (req, res) =>
		if not @.isValidRequest(req)
			resp = new AjaxResponse()
			resp.failure('Bad Request', 400)
			res.json(resp, 200)
			return
		
		db = QRefDatabase.instance()
		token = req.param('token')
		
		UserAuth.validateToken(token, (err, isTokenValid) ->
			if err? or not isTokenValid == true
				resp = new AjaxResponse()
				resp.failure('Not Authorized', 403)
				res.json(resp, 200)
				return
			
			# Validate Admin Only Access
			
			query = db.AircraftChecklist.find()
		
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
					
				db.AircraftChecklist.count((err, count) ->
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
		if not @.isValidRequest(req)
			resp = new AjaxResponse()
			resp.failure('Bad Request', 400)
			res.json(resp, 200)
			return
		
		db = QRefDatabase.instance()
		token = req.param('token')
		
		UserAuth.validateToken(token, (err, isTokenValid) ->
			if err? or not isTokenValid == true
				resp = new AjaxResponse()
				resp.failure('Not Authorized', 403)
				res.json(resp, 200)
				return
				
			# Validate Permissions Here
			
			newObj = new db.AircraftChecklist()
	
			newObj.manufacturer = req.body.manufacturer
			newObj.model = req.body.model
			newObj.preflight = req.body.preflight
			newObj.takeoff = req.body.takeoff
			newObj.landing = req.body.landing
			newObj.emergencies = req.body.emergenices
			newObj.serialNumber = req.body.serialNumber
			newObj.modelYear = req.body.modelYear
			
			if req.body?.tailNumber?
				newObj.tailNumber = req.body.tailNumber
				
			if req.body?.user?
				newObj.user = req.body.user
			
			if req.body?.version?
				newObj.version = req.body.version
			else 
				newObj.version = 1
			
			if req.body?.productIcon?
				newObj.productIcon = req.body.productIcon
			
			if req.body?.coverImage?
				newObj.coverImage = req.body.coverImage
			
			newObj.save((err) ->
				if err?
					resp = new AjaxResponse()
					resp.failure(err, 500)
					res.json(resp, 200)
					return
				
				resp = new AjaxResponse()
				resp.setTotal(1)
				resp.addRecord(newObj)
				res.json(resp, 200)
			)
			
		)
		

	isValidRequest: (req) ->
		if (req.query? and req.query?.token?) or
			  (req.body? and req.body?.token? and req.body?.model? and  
			 	req.body?.manufacturer? and req.body?.preflight? and req.body?.takeoff? and
			 	req.body?.landing? and req.body?.emergencies? and
			 	req.body?.modelYear and req.body?.serialNumber and
			 	req.body?.mode? and req.body.mode == 'ajax')
			true
		else
			false 
	
module.exports = new AircraftChecklistsRoute()