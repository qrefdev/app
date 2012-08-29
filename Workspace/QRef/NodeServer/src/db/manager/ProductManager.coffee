async = require('async')
mongoose = require('mongoose')
QRefDatabase = require('../QRefDatabase')

class ProductManager
	constructor: () ->
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
			eProd.productType == 'checklist' and eProd.aircraftChecklist?)
				db.AircraftChecklist.findById(eProd.aircraftChecklist)
					.exec((err, chklst) ->
						if err?
							callback(err, null)
							return
						
						if not chklst?
							callback('Not Found', null)
							return
							
						chklst = chklst.toObject()
						eProd.aircraftChecklist = chklst
						
						async.parallel([
										(cb) ->
											if not chklst.manufacturer?
												cb(null)
												return
												
											db.AircraftManufacturer.findById(chklst.manufacturer)
												.exec((err, mfr) ->
													if err?
														cb(err)
													if not mfr?
														cb('Not Found')
													
													chklst.manufacturer = mfr.toObject()
													cb(null)
												)
										,
										(cb) ->
											if not chklst.model?
												cb(null)
												return
												
											db.AircraftModel.findById(chklst.model)
												.exec((err, mdl) ->
													if err?
														cb(err)
													if not mdl?
														cb('Not Found')
													
													chklst.model = mdl.toObject()
													cb(null)
												)
									],
									(err, results) ->
									
										if err?
											callback(err, null)
											return
											
										callback(null, eProd)
						)
						
				)
		else
			callback(null, eProd)
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