async = require('async')
mongoose = require('mongoose')
QRefDatabase = require('../QRefDatabase')

###
Utility class used to provide common operations on {ProductSchemaInternal} object instances.
@author Nathan Klick
@copyright QRef 2012
###
class ProductManager
	###
	Creates a new instance of the ProductManager class.  
	###
	constructor: () ->
	###
	Performs deep property population on a single {ProductSchemaInternal} object.
	@param product [ProductSchemaInternal] The object to deeply populate.
	@param callback [Function] A function meeting the {Callbacks#managerExpandItemCallback} requirements. 
	###
	expand: (product, callback) ->
		db = QRefDatabase.instance()
		if not product?
			callback('Product cannot be null', null)
			return
		
		if product.toObject?
			eProd = product.toObject()
		else
			eProd = product
		
		if (eProd.productCategory == 'aviation' and
			eProd.productType == 'checklist')
				async.parallel([
								(cb) ->
									if not eProd.manufacturer?
										cb(null)
										return
										
									db.AircraftManufacturer.findById(eProd.manufacturer)
										.exec((err, mfr) ->
											if err?
												cb(err)
											if not mfr?
												cb('Not Found')
											
											eProd.manufacturer = mfr.toObject()
											cb(null)
										)
								,
								(cb) ->
									if not eProd.model?
										cb(null)
										return
										
									db.AircraftModel.findById(eProd.model)
										.exec((err, mdl) ->
											if err?
												cb(err)
											if not mdl?
												cb('Not Found')
											
											eProd.model = mdl.toObject()
											cb(null)
										)
							],
							(err, results) ->
							
								if err?
									callback(err, null)
									return
									
								callback(null, eProd)
				)
						
		else
			callback(null, eProd)
	###
	Performs deep property population on an array of {ProductSchemaInternal} objects.
	@param arrProducts [Array<ProductSchemaInternal>] The array of objects to deeply populate.
	@param callback [Function] A function meeting the {Callbacks#managerExpandArrayCallback} requirements. 
	###
	expandAll: (arrProducts, callback) =>
		if not arrProducts?
			callback('Array cannot be a null reference', null)
		
		eArrProducts = []
		
		async.forEach(arrProducts, 
			(item, cb) =>
				@.expand(item, (err, newItem) ->
					if err?
						 cb(err)
						 return
					
					eArrProducts.push(newItem)
					cb(null)
				)
			,
			(err) ->
				if err?
					callback(err, null)
					return
				
				callback(null, eArrProducts)
		)
module.exports = ProductManager