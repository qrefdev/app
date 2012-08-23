AjaxRoute = require('../../../AjaxRoute')
AjaxResponse = require('../../../../serialization/AjaxResponse')
UserAuth = require('../../../../security/UserAuth')
QRefDatabase = require('../../../../db/QRefDatabase')
class AircraftManufacturersRoute extends AjaxRoute
	constructor: () ->
		super [{ method: 'POST', path: '/manufacturers' }, { method: 'GET', path: '/manufacturers' }]
	get: (req, res) =>
		if not @.isValidRequest(req)
			resp = new AjaxResponse()
			resp.failure('Bad Request', 400)
			res.json(resp, 200)
			return
		
		db = new QRefDatabase()
		token = req.param('token')
		
		UserAuth.validateToken(token, (err, isTokenValid) ->
			if err? or not isTokenValid == true
				resp = new AjaxResponse()
				resp.failure('Not Authorized', 403)
				res.json(resp, 200)
				return
			
			query = db.AircraftManufacturer.find()
		
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
					
				db.AircraftManufacturer.count((err, count) ->
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
		
		db = new QRefDatabase()
		token = req.param('token')
		
		UserAuth.validateToken(token, (err, isTokenValid) ->
			if err? or not isTokenValid == true
				resp = new AjaxResponse()
				resp.failure('Not Authorized', 403)
				res.json(resp, 200)
				return
			# Validate Permissions Here
			
			newObj = new db.AircraftManufacturer()
			newObj.name = req.body.name
			
			if req.body?.description?
				newObj.description = req.body.description
			
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
			 (req.body? and req.body?.token? and req.body?.name? and req.body?.mode? and req.body.mode == 'ajax')
			true
		else
			false 
	
module.exports = new AircraftManufacturersRoute()