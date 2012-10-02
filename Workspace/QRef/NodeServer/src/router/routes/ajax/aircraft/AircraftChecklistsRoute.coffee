AjaxRoute = require('../../../AjaxRoute')
AjaxResponse = require('../../../../serialization/AjaxResponse')
UserAuth = require('../../../../security/UserAuth')
QRefDatabase = require('../../../../db/QRefDatabase')
ChecklistManager = require('../../../../db/manager/ChecklistManager')
AircraftChecklistFilter = require('../../../../security/filters/AircraftChecklistFilter')
###
Service route that allows the retrieval of all checklists and the creation of new checklists.
@example Service Methods (see {CreateAircraftChecklistAjaxRequest})
  Request Format: application/json
  Response Format: application/json
  
  GET /services/ajax/aircraft/checklists?token=:token
    :token - (Required) A valid authentication token.
    
  Retrieves all checklists.
  
  POST /services/ajax/aircraft/checklists
  	@BODY - (Required) CreateAircraftChecklistAjaxRequest
  	
  Creates a new checklist.
@author Nathan Klick
@copyright QRef 2012
###
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
		mgr = new ChecklistManager()
		token = req.param('token')
		filter = new AircraftChecklistFilter(token)
		
		UserAuth.validateToken(token, (err, isTokenValid) ->
			if err? or not isTokenValid == true
				resp = new AjaxResponse()
				resp.failure('Not Authorized', 403)
				res.json(resp, 200)
				return
			
			filter.constrainQuery({}, (err, objQuery) ->
				if err?
					resp = new AjaxResponse()
					resp.failure('Not Authorized', 403)
					res.json(resp, 200)
					return
				
				if not objQuery?
					resp = new AjaxResponse()
					resp.failure('Not Authorized', 403)
					res.json(resp, 200)
					return
				
				query = db.AircraftChecklist.find(objQuery)
			
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
						
						#console.log('Expanding records.')
						mgr.expandAll(arrObjs, (err, arrCheckLists) ->
							if err?
								resp = new AjaxResponse()
								resp.failure('Internal Error', 500)
								res.json(resp, 200)
								return
								
							#console.log('Returning expanded records.')
							resp = new AjaxResponse()
							resp.addRecords(arrCheckLists)
							resp.setTotal(count)
							res.json(resp, 200)
						)
						
					)
					
				)
			)
			# Validate Admin Only Access
			
			
		)
	post: (req, res) =>
		if not @.isValidRequest(req)
			resp = new AjaxResponse()
			resp.failure('Bad Request', 400)
			res.json(resp, 200)
			return
		
		db = QRefDatabase.instance()
		token = req.param('token')
		filter = new AircraftChecklistFilter(token)
		
		UserAuth.validateToken(token, (err, isTokenValid) ->
			if err? or not isTokenValid == true
				resp = new AjaxResponse()
				resp.failure('Not Authorized', 403)
				res.json(resp, 200)
				return
				
			
			filter.create((err, isAllowed) ->
				
				if err?
					resp = new AjaxResponse()
					resp.failure('Not Authorized', 403)
					res.json(resp, 200)
					return
				
				if not isAllowed
					resp = new AjaxResponse()
					resp.failure('Not Authorized', 403)
					res.json(resp, 200)
					return
				
				newObj = new db.AircraftChecklist()
	
				newObj.manufacturer = req.body.manufacturer
				newObj.model = req.body.model
				newObj.preflight = req.body.preflight
				newObj.takeoff = req.body.takeoff
				newObj.landing = req.body.landing
				newObj.emergencies = req.body.emergenices
				#newObj.modelYear = req.body.modelYear
				
				if req.body?.tailNumber?
					newObj.tailNumber = req.body.tailNumber
					
				if req.body?.index?
					newObj.index = req.body.index
					
				if req.body?.user?
					newObj.user = req.body.user
				
				if req.body?.version?
					newObj.version = req.body.version
				else 
					newObj.version = 1
				
				if req.body?.productIcon?
					newObj.productIcon = req.body.productIcon
				
				#if req.body?.coverImage?
				#	newObj.coverImage = req.body.coverImage
				
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
			# Validate Permissions Here
			
			
			
		)
		

	isValidRequest: (req) ->
		if (req.query? and req.query?.token?) or
			  (req.body? and req.body?.token? and req.body?.model? and  
			 	req.body?.manufacturer? and req.body?.preflight? and req.body?.takeoff? and
			 	req.body?.landing? and req.body?.emergencies? and
			 	req.body?.mode? and req.body.mode == 'ajax')
			true
		else
			false 
	
module.exports = new AircraftChecklistsRoute()