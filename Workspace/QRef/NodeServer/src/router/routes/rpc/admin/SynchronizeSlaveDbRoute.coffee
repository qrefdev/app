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
class SynchronizeSlaveDbRoute extends RpcRoute
	constructor: () ->
		super [{ method: 'POST', path: '/syncSlaveDb' }, { method: 'GET', path: '/syncSlaveDb' }]
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
			
			@.synchronize((err) =>
				if err?
					resp = new RpcResponse(null)
					resp.failure(err, 500)
					res.json(resp, 200)
					return
					
				resp = new RpcResponse(null)
				res.json(resp, 200)
				return
			)
			
			###
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
			###
		)
	synchronize: (callback) =>
		masterDb = QRefSlaveManager.getSlave('master')
		slaveDb = QRefSlaveManager.getSlave('slave')
		
		masterDb.AircraftChecklist
		.where('user')
		.equals(null)
		.where('isDeleted')
		.equals(false)
		.find((err, arrMasterChecklists) => 
			if err?
				callback(err)
				return
			
			arrTargetVersions = []
			
			async.series(
				[
					(sCb) => 
						async.forEach(arrMasterChecklists,
							(mChkLst, cb) =>
								foundVector = null
								
								for tv in arrTargetVersions
									if tv.model.toString() == mChkLst.model.toString() and tv.manufacturer.toString() == mChkLst.manufacturer.toString()
										foundVector = tv
										break
								
								if not foundVector?
									foundVector = { model: mChkLst.model, manufacturer: mChkLst.manufacturer, version: mChkLst.version }
									arrTargetVersions.push(foundVector)
								else
									if mChkLst.version > foundVector.version
										foundVector.version = mChkLst.version
								
								cb(null)
							,(err) =>
								if err?
									sCb(err)
									return
								
								sCb(null)
						)
					,(sCb) =>
						async.forEach(arrTargetVersions, 
							(tv, cb) =>
								sChkLstVersion = 0
								masterDb.AircraftChecklist
								.where('model')
								.equals(tv.model)
								.where('manufacturer')
								.equals(tv.manufacturer)
								.where('version')
								.equals(tv.version)
								.findOne((err, mChkLst) =>
									if err?
										cb(err)
										return
									
									if not mChkLst?
										cb(new Error('Master checklist not found'))
										return
									
									slaveDb.AircraftChecklist
									.where('manufacturer')
									.equals(mChkLst.manufacturer)
									.where('model')
									.equals(mChkLst.model)
									.where('user')
									.equals(null)
									.sort('-version')
									.findOne((err, sChkLst) =>
										if err?
											cb(err)
											return
										
										if not sChkLst?
											sChkLstVersion = 0
										else
											sChkLstVersion = sChkLst.version
											
										mChkLst = mChkLst.toObject()
										
										sNewChkLst = new slaveDb.AircraftChecklist()
										sNewChkLst.manufacturer = mChkLst.manufacturer
										sNewChkLst.model = mChkLst.model
										sNewChkLst.preflight = mChkLst.preflight
										sNewChkLst.takeoff = mChkLst.takeoff
										sNewChkLst.landing = mChkLst.landing
										sNewChkLst.emergencies = mChkLst.emergencies
										sNewChkLst.tailNumber = mChkLst.tailNumber
										sNewChkLst.index = mChkLst.index
										sNewChkLst.user = mChkLst.user
										sNewChkLst.version = sChkLstVersion + 1
										sNewChkLst.productIcon = mChkLst.productIcon
										
										sNewChkLst.save((err)=>
											if err?
												cb(err)
												return
											
											slaveDb.AircraftChecklist
											.where('manufacturer')
											.equals(mChkLst.manufacturer)
											.where('model')
											.equals(mChkLst.model)
											.where('user')
											.equals(null)
											.where('version')
											.ne(sChkLstVersion + 1)
											.where('isDeleted')
											.equals(false)
											.find((err, arrPreviousItems) =>
												if err?
													cb(err)
													return
												
												async.forEach(arrPreviousItems,
													(pItem, zCb) =>
														pItem.isDeleted = true
														pItem.save(zCb)
													,(err) =>
														if err?
															cb(err)
															return
														
														cb(null)
												)
											)
										)
										
									)
								)
								
								
							,(err) =>
								if err?
									sCb(err)
									return
								
								sCb(null)
						)
				],
				(err) =>
					if err?
						callback(err)
						return
					
					@.upgradeProductVersions(slaveDb, callback)
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
module.exports = new SynchronizeSlaveDbRoute()