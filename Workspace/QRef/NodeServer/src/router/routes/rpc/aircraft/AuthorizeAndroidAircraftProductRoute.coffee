RpcRoute = require('../../../RpcRoute')
QRefDatabase = require('../../../../db/QRefDatabase')
RpcResponse = require('../../../../serialization/RpcResponse')
UserAuth = require('../../../../security/UserAuth')
crypto = require('crypto')
fs = require('fs')
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
class AuthorizeAndroidAircraftProductRoute extends RpcRoute
	constructor: () ->
		super [{ method: 'POST', path: '/product/authorize/android' }, { method: 'GET', path: '/product/authorize/android' }]
	post: (req, res) =>
		if not @.isValidRequest(req)
			resp = new RpcResponse(null)
			resp.failure('Bad Request', 400)
			res.json(resp, 200)
			return
		
		token = req.param('token')
		productId = req.body.product
		db = QRefDatabase.instance()
		receiptData = req.body.receipt
		
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
						
					attempt = new db.AircraftProductAuthorizationAttempt()
					attempt.user = user._id
					attempt.product = product._id
					attempt.attemptType = 'android'
					attempt.androidReceiptHash = receiptData
					
					attempt.save((err) => 
						
						if err?
							resp = new RpcResponse(null)
							resp.failure('Internal Error', 500)
							res.json(resp, 200)
							return
						
						@.validateReceipt(user, receiptData, (err, receipt) =>
							if err?
								resp = new RpcResponse(null)
								resp.failure('Internal Error', 500)
								res.json(resp, 200)
								return
								
							if not receipt?
								resp = new RpcResponse(null)
								resp.failure('Internal Error', 500)
								res.json(resp, 200)
								return
							
							attempt.androidReceipt = receipt
								
							if receipt.status == 0 and receipt.productId == product.androidProductIdentifier
								attempt.isReceiptValid = true
								
								attempt.save((err) =>
									if err?
										resp.failure('Internal Error', 500)
										res.json(resp, 200)
										return
									
									uProduct = new db.UserProduct()
									uProduct.user = user._id
									uProduct.product = product._id
									
									uProduct.save((err) => 
										if err? and not err.code == 11000
											resp = new RpcResponse(null)
											resp.failure('Internal Error', 500)
											res.json(resp, 200)
											return
											
										@.cloneChecklist(product.aircraftChecklist, user, tailNumber, (err, checklistId) =>
											if err?
												resp = new RpcResponse(null)
												resp.failure('Internal Error', 500)
												res.json(resp, 200)
												return
											
											attempt.isComplete = true
											attempt.checklist = checklistId
											
											attempt.save((err) =>
												if err?
													resp = new RpcResponse(null)
													resp.failure('Internal Error', 500)
													res.json(resp, 200)
													return	
												
												resp = new RpcResponse(checklistId)
												res.json(resp, 200)
												return
											)
										)
									)
									
								)
							else
								attempt.isReceiptValid = false
								
								attempt.save((err) =>
									if err?
										resp = new RpcResponse(null)
										resp.failure('Internal Error', 500)
										res.json(resp, 200)
										return

									resp = new RpcResponse(null)
									resp.failure('Invalid Receipt', 403)
									res.json(resp, 200)
									return
								)
							
						)
					)
					
				)
			)
		)
	cloneChecklist: (oChecklist, user, tailNumber, callback) ->
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
		nChecklist.productIcon = oChecklist.productIcon
		nChecklist.preflight = oChecklist.preflight
		nChecklist.takeoff = oChecklist.takeoff
		nChecklist.landing = oChecklist.landing
		nChecklist.emergencies = oChecklist.emergencies
		nChecklist.isDeleted = false
		
		nChecklist.save((err) -> 
			if err?
				callback(err, null)
				return
			callback(null, nChecklist._id)
		)
	
	validateReceipt: (user, receiptData, callback) =>
		receipt = JSON.parse((new Buffer(receiptData, 'base64')).toString())
		
		signature = receipt.signature;
		
		db = QRefDatabase.instance()
		
		db.AircraftProductAuthorizationAttempt.find({ user: user_id}, (err, attempts) => 
			if err?
				callback(err, null)
				return
				
			if attempts? and attempts.length > 0
				for attempt in attempts 
					if attempt.androidReceipt?
						if attempt.androidReceipt.orderId == receipt.orderId
							receipt.status = 0
							callback(null, receipt)
							return
			
			fs.readFile('androidPublicKey.pem', 'utf8', (err, data) => 
				if err?
					callback(err, null)
					return
					
				verifier = crypto.createVerify('RSA')
				
				if verifier.verify(data, signature, 'base64')
					receipt.status = 0
					callback(null, receipt)
					return
				else
					receipt.status = 1
					callback(null, receipt)
					return
			)
		)
		
		
			
	isValidRequest: (req) ->
		if req.body? and req.body?.mode? and req.body.mode == 'rpc' and req.body?.product? and req.body?.receipt?
			true
		else
			false
			
module.exports = new AuthorizeAndroidAircraftProductRoute()