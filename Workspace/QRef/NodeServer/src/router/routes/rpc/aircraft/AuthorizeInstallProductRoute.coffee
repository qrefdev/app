RpcRoute = require('../../../RpcRoute')
QRefDatabase = require('../../../../db/QRefDatabase')
RpcResponse = require('../../../../serialization/RpcResponse')
UserAuth = require('../../../../security/UserAuth')
https = require('https')
async = require('async')
###
Service route that performs authentication of Apple IAP Requests.
@example Service Methods (see {AuthorizeAppleProductRequest})
  Request Format: application/json
  Response Format: application/json
  
  POST /services/rpc/aircraft/product/authorize/apple
    @BODY - (Required) AuthorizeAppleProductRpcRequest
    
  Performs apple IAP authorization and returns the handle to the user specific checklist if successful.
@author Nathan Klick
@copyright QRef 2012
###
class AuthorizeInstallProductRoute extends RpcRoute
	constructor: () ->
		super [{ method: 'POST', path: '/product/authorize/install' }, { method: 'GET', path: '/product/authorize/install' }]
	post: (req, res) =>
		if not @.isValidRequest(req)
			resp = new RpcResponse(null)
			resp.failure('Bad Request', 400)
			res.json(resp, 200)
			return
		
		token = req.param('token')
		productId = req.body.product
		db = QRefDatabase.instance()
		
		tailNumber = null
		
		if req.body?.tailNumber?
			tailNumber = req.body.tailNumber
	
		UserAuth.validateToken(token, (err, isTokenValid) =>
			if err? or not isTokenValid == true
				resp = new RpcResponse(null)
				resp.failure('Not Authorized', 403)
				res.json(resp, 200)
				return
				
			UserAuth.userFromToken(token, (err, user) => 
				if err? or not user?
					resp = new RpcResponse(null)
					resp.failure('Not Authorized', 403)
					res.json(resp, 200)
					return
					
				db.Product.findOne({ _id: productId })
						.populate('aircraftChecklist')
						.exec((err, product) =>
					if err?
						resp = new RpcResponse(null)
						resp.failure('Internal Error', 500)
						res.json(resp, 200)
						return
					
					if not product?
						resp = new RpcResponse(null)
						resp.failure('Product Not Found', 404)
						res.json(resp, 200)
						return
							
					@.userOwnsProduct(product._id, user, (err, success) =>
						if err?
							resp = new RpcResponse(null)
							resp.failure('Internal Error', 500)
							res.json(resp, 200)
							return
						
						if success					
							@.cloneChecklist(product.aircraftChecklist, product, user, tailNumber, (err, checklistId) =>
								if err?
									resp = new RpcResponse(null)
									resp.failure('Internal Error', 500)
									res.json(resp, 200)
									return
								else	
									resp = new RpcResponse(checklistId)
									res.json(resp, 200)
									return
							)
						else
							resp = new RpcResponse(null)
							resp.failure('Product Not Found', 404)
							res.json(resp, 200)
							return
					)
				)
			)
		)
	
	userOwnsProduct: (productId, user, callback) =>
		db = QRefDatabase.instance()
		db.UserProduct.findOne({ product: productId, user: user._id}, (err, product) =>
			if err?
				callback(err, false);
				return;
				
			if product?
				callback(null, true);
				return;
		)
	
	cloneChecklist: (oChecklist, product, user, tailNumber, callback) =>
		db = QRefDatabase.instance()
		nChecklist = new db.AircraftChecklist()
		
		if not oChecklist?
			callback(new Error('Product does not have an associated checklist.'), null)
			return
		
		nChecklist.model = oChecklist.model
		nChecklist.manufacturer = oChecklist.manufacturer
		nChecklist.index = null
		
		if tailNumber?
			nChecklist.tailNumber = tailNumber
		else
			nChecklist.tailNumber = null
		
		nChecklist.user = user._id
		nChecklist.version = 1
		nChecklist.productIcon = product.productIcon
		nChecklist.preflight = oChecklist.preflight
		nChecklist.takeoff = oChecklist.takeoff
		nChecklist.landing = oChecklist.landing
		nChecklist.emergencies = oChecklist.emergencies
		nChecklist.isDeleted = false
		
		nChecklist.save((err) => 
			if err?
				callback(err, null)
				return
				
			callback(null, nChecklist._id)
		)	
		
	isValidRequest: (req) ->
		if req.body? and req.body?.mode? and req.body.mode == 'rpc' and req.body?.product?
			true
		else
			false
			
module.exports = new AuthorizeInstallProductRoute()