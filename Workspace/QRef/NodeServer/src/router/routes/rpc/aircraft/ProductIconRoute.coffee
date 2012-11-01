RpcRoute = require('../../../RpcRoute')
QRefDatabase = require('../../../../db/QRefDatabase')
RpcResponse = require('../../../../serialization/RpcResponse')
UserAuth = require('../../../../security/UserAuth')
https = require('https')
async = require('async')
fs = require('fs-extra')
mime = require('mime')
###
Service route that saves an uploaded productIcon and returns the final path to image.
@example Service Methods (see {ProductImageRpcRequest})
  Request Format: application/json
  Response Format: application/json
  
  POST /services/rpc/aircraft/product/icon
    @BODY - (Required) ProductImageRpcRequest
    
	Returns the next available version number in the returnValue field of the response object.
@author Nathan Klick
@copyright QRef 2012
###
class ProductIconRoute extends RpcRoute
	constructor: () ->
		super [{ method: 'POST', path: '/product/icon' }, { method: 'GET', path: '/product/icon' }]
	post: (req, res) =>
		if not @.isValidRequest(req)
			resp = new RpcResponse(null)
			resp.failure('Bad Request', 400)
			res.json(resp, 200)
			return
		
		db = QRefDatabase.instance()
		fileKeys = Object.keys(req.files)
		token = req.param('token')
		productId = req.body.product
		
		fsPath = '/storage/http/qref/WebContent/images/product/icons/'
		webPath = 'images/product/icons/'
		
		if fileKeys.length == 0 or fileKeys.length > 1
			resp = new RpcResponse(null)
			resp.failure('Bad Request', 400)
			res.json(resp, 200)
			return
		
		db.Product.findById(productId, (err, product) ->
			if err?
				resp = new RpcResponse(null)
				resp.failure(err, 500)
				res.json(resp, 200)
				return
			
			if not product?
				resp = new RpcResponse(null)
				resp.failure('Not Found', 404)
				res.json(resp, 200)
				return
			
			file = req.files[fileKeys[0]]
			slashPos = file.path.lastIndexOf('/')
			
			if slashPos > 0
				fileName = file.path.slice(slashPos+1)
			else
				fileName = file.path
			
			ext = mime.extension(file.type)
		
			
			targetPath = fsPath + file.name
			targetWebPath = webPath + file.name
			
			fs.copy(file.path, targetPath, (err) ->
				if err?
					console.log("File System Error { targetPath: '" + targetPath + "', targetWebPath: '" + targetWebPath + "', slashPos: " + slashPos + ", fileName: '" + fileName + "', file.path: '" + file.path + "' }")
					resp = new RpcResponse(null)
					resp.failure(err, 500)
					res.json(resp, 200)
					return
				
				product.productIcon = targetWebPath
				
				product.save((err) ->
					if err?
						resp = new RpcResponse(null)
						resp.failure(err, 500)
						res.json(resp, 200)
						return
					
					fs.unlink(file.path, (err) -> 
						resp = new RpcResponse(targetWebPath)
						res.json(resp, 200)
						return
					)
				)
			)
			
			
			
			
		)
		
	
	isValidRequest: (req) ->
		if req.body? and req.body?.mode? and req.body.mode == 'rpc' and req.body?.product? and req.body?.token?
			true
		else
			false
module.exports = new ProductIconRoute()