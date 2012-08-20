AjaxRoute = require('../../../AjaxRoute')
AjaxResponse = require('../../../../serialization/AjaxResponse')
UserAuth = require('../../../../security/UserAuth')
QRefDatabase = require('../../../../db/QRefDatabase')
class CurrentUserProductsRoute extends AjaxRoute
	constructor: () ->
		super [{ method: 'POST', path: '/products' }, { method: 'GET', path: '/products' }]
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
			
			UserAuth.userFromToken(token, (err, usr) ->
				if err?
					resp = new AjaxResponse()
					resp.failure(err, 500)
					res.json(resp, 200)
					return 
					
				if not usr?
					resp = new AjaxResponse()
					resp.failure('Not Found', 404)
					res.json(resp, 200)
					return
				
				query = db.UserProduct.find()
				query = query.where('user').equals(usr._id).populate('product')
							.populate('product.aircraftChecklist')
				
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
						
					db.UserProduct.where('user')
								.equals(usr._id)
								.count((err, count) ->
						if err?
							resp = new AjaxResponse()
							resp.failure('Internal Error', 500)
							res.json(resp, 200)
							return
						
						resp = new AjaxResponse()
	
						for itm in arrObjs
							resp.addRecord(itm.product)					
	
						resp.setTotal(count)
						res.json(resp, 200)
					)
					
				)
				
			)
			
			
		)
	post: (req, res) =>
		resp = new AjaxResponse()
		resp.failure('Forbidden', 403)
		res.json(resp, 200)
		return
		

	isValidRequest: (req) ->
		if (req.query? and req.query?.token?)
			true
		else
			false 
	
module.exports = new CurrentUserProductsRoute()