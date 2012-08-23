AjaxRoute = require('../../../AjaxRoute')
AjaxResponse = require('../../../../serialization/AjaxResponse')
UserAuth = require('../../../../security/UserAuth')
QRefDatabase = require('../../../../db/QRefDatabase')
class ProductRoute extends AjaxRoute
	constructor: () ->
		super [{ method: 'POST', path: '/product/:productId' }, { method: 'GET', path: '/product/:productId' }]
	get: (req, res) =>
		if not @.isValidRequest(req)
			resp = new AjaxResponse()
			resp.failure('Bad Request', 400)
			res.json(resp, 200)
			return
		
		db = new QRefDatabase()
		token = req.param('token')
		productId = req.params.productId
		
		UserAuth.validateToken(token, (err, isTokenValid) ->
			if err? or not isTokenValid == true
				resp = new AjaxResponse()
				resp.failure('Not Authorized', 403)
				res.json(resp, 200)
				return
			
			query = db.Product.findById(productId)
			
			
			query.exec((err, obj) ->
				if err?
					resp = new AjaxResponse()
					resp.failure('Internal Error', 500)
					res.json(resp, 200)
					return
					
				if not obj?
					resp = new AjaxResponse()
					resp.failure('Not Found', 404)
					res.json(resp, 200)
					return
				
					
				resp = new AjaxResponse()
				resp.addRecord(obj)
				resp.setTotal(1)
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
		productId = req.params.productId
		
		UserAuth.validateToken(token, (err, isTokenValid) ->
			if err? or not isTokenValid == true
				resp = new AjaxResponse()
				resp.failure('Not Authorized', 403)
				res.json(resp, 200)
				return
			# Validate Permissions Here
			
			db.Product.findById(productId, (err, obj) ->
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
					
				if req.body?.name?
					obj.name = req.body.name
				
				if req.body?.productType?
					obj.productType = req.body.productType
				
				if req.body?.productCategory?
					obj.productCategory = req.body.productCategory
				
				if req.body?.isPublished?
					obj.isPublished = req.body.isPublished
				
				if req.body?.appleProductIdentifier?
					obj.appleProductIdentifier = req.body.appleProductIdentifier
				
				if req.body?.androidProductIdentifier?
					obj.androidProductIdentifier = req.body.androidProductIdentifier
					
				if req.body?.isAppleEnabled?
					obj.isAppleEnabled = req.body.isAppleEnabled
				
				if req.body?.isAndroidEnabled?
					obj.isAndroidEnabled = req.body.isAndroidEnabled
				
				if req.body?.suggestedRetailPrice?
					obj.suggestedRetailPrice = req.body.suggestedRetailPrice
				
				if req.body?.aircraftChecklist?
					obj.aircraftChecklist = req.body.aircraftChecklist
					
				
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
		if (req.query? and req.query?.token? and req.params?.productId) or
			 (req.body? and req.body?.token? and req.params?.productId? and 
			 req.body?.mode? and req.body.mode == 'ajax')
			true
		else
			false 
	
module.exports = new ProductRoute()