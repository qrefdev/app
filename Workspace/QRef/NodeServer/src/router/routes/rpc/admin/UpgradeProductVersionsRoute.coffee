RpcRoute = require('../../../RpcRoute')
QRefSlaveManager = require('../../../../db/QRefSlaveManager')
RpcResponse = require('../../../../serialization/RpcResponse')
UserAuth = require('../../../../security/UserAuth')
https = require('https')
async = require('async')
###
Service route that returns the next available version of a given checklist.
@example Service Methods (see {ChecklistVersionRpcRequest})
  Request Format: application/json
  Response Format: application/json
  
  POST /services/rpc/aircraft/checklist/version
    @BODY - (Required) ChecklistVersionRpcRequest
    
	Returns the next available version number in the returnValue field of the response object.
@author Nathan Klick
@copyright QRef 2012
###
class UpgradeProductVersionsRoute extends RpcRoute
	constructor: () ->
		super [{ method: 'POST', path: '/upgradeProductVersions' }, { method: 'GET', path: '/upgradeProductVersions' }]
	post: (req, res) =>
		if not @.isValidRequest(req)
			resp = new RpcResponse(null)
			resp.failure('Bad Request', 400)
			res.json(resp, 200)
			return
		
		token = req.param('token')
		
		UserAuth.isInRole(token, 'Administrators', (err, hasRole) =>
			if err?
				resp = new RpcResponse(null)
				resp.failure('Internal Error', 500)
				res.json(resp, 200)
				return
			
			if not hasRole
				resp = new RpcResponse(null)
				resp.failure('Not Authorized', 403)
				res.json(resp, 200)
				return
			
			async.forEach(QRefSlaveManager.getSlaves(), 
				(item, cb) =>
					@.upgradeProductVersions(item, cb)
				,(err) =>
					if err?
						resp = new RpcResponse(null)
						resp.failure('Internal Error', 500)
						res.json(resp, 200)
						return
					
					resp = new RpcResponse(null)
					res.json(resp, 200)
					return
			)
		)
		
	upgradeProductVersions: (db, callback) =>
		db.Product.find((err, arrProducts) =>
			if err?
				callback(err)
				return
			
			if not arrProducts? or arrProducts.length == 0
				callback(null)
				return
			
			async.forEach(arrProducts, 
				(product, cb) =>
					db.AircraftChecklist
					.where('manufacturer')
					.equals(product.manufacturer)
					.where('model')
					.equals(product.model)
					.where('user')
					.equals(null)
					.where('isDeleted')
					.equals(false)
					.sort('-version')
					.findOne((err, latestChecklist) =>
						if err?
							cb(err)
							return
						
						if not latestChecklist?
							cb(new Error('No checklist found for the product.'))
							return
						
						if product.aircraftChecklist.toString() != latestChecklist._id.toString()
							product.aircraftChecklist = latestChecklist._id
						
						product.save(cb)
					)
				,(err) =>
					callback(err)
			)
				
		)
	
	isValidRequest: (req) ->
		if req.body? and req.body?.mode? and req.body.mode == 'rpc' and req.body?.token?
			true
		else
			false
module.exports = new UpgradeProductVersionsRoute()