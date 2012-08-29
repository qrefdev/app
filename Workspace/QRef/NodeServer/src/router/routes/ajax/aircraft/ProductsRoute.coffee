AjaxRoute = require('../../../AjaxRoute')
AjaxResponse = require('../../../../serialization/AjaxResponse')
UserAuth = require('../../../../security/UserAuth')
QRefDatabase = require('../../../../db/QRefDatabase')
class ProductsRoute extends AjaxRoute
	constructor: () ->
		super [{ method: 'POST', path: '/products' }, { method: 'GET', path: '/products' }]
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
			
			query = db.Product.find()
			query = query.where('productCategory').equals('aviation')
			
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
					
				db.Product.where('productCategory')
							.equals('aviation')
							.count((err, count) ->
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
			
			newObj = new db.Product()
			newObj.name = req.body.name
			newObj.productType = req.body.productType
			
			if req.body?.productCategory?
				newObj.productCategory = req.body.productCategory
			else
				newObj.productCategory = 'aviation'
			
			if req.body?.isPublished?
				newObj.isPublished = req.body.isPublished
			
			if req.body?.appleProductIdentifier?
				newObj.appleProductIdentifier = req.body.appleProductIdentifier
			
			if req.body?.androidProductIdentifier?
				newObj.androidProductIdentifier = req.body.androidProductIdentifier
				
			if req.body?.isAppleEnabled?
				newObj.isAppleEnabled = req.body.isAppleEnabled
			
			if req.body?.isAndroidEnabled?
				newObj.isAndroidEnabled = req.body.isAndroidEnabled
			
			if req.body?.suggestedRetailPrice?
				newObj.suggestedRetailPrice = req.body.suggestedRetailPrice
			
			if req.body?.aircraftChecklist?
				newObj.aircraftChecklist = req.body.aircraftChecklist
				
			
			newObj.save((err) ->
				if err?
					resp = new AjaxResponse()
					resp.failure(err, 500)
					res.json(resp, 200)
					return
					
				resp = new AjaxResponse()
				resp.addRecord(newObj)
				resp.setTotal(1)
				res.json(resp, 200)
			)
		
			
		)
		

	isValidRequest: (req) ->
		if (req.query? and req.query?.token?) or
			 (req.body? and req.body?.token? and req.body?.name? and 
			 req.body?.productType? and req.body?.mode? and req.body.mode == 'ajax')
			true
		else
			false 
	
module.exports = new ProductsRoute()