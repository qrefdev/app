async = require('async')
mongoose = require('mongoose')
QRefDatabase = require('../QRefDatabase')

###
Utility class used to provide common operations on {AircraftChecklistSchemaInternal} object instances.
@author Nathan Klick
@copyright QRef 2012
###
class ChecklistManager
	###
	Creates a new instance of the ChecklistManager class.  
	###
	constructor: () ->
	###
	Performs deep property population on a single {AircraftChecklistSchemaInternal} object.
	@param chklst [AircraftChecklistSchemaInternal] The object to deeply populate.
	@param callback [Function] A function meeting the {Callbacks#managerExpandItemCallback} requirements. 
	###
	expand: (chklst, callback) ->
		db = QRefDatabase.instance()
		if not chklst?
			callback('Checklist cannot be null', null)
			return
		
		if chklst.toObject?
			eChklst = chklst.toObject()
		else
			eChklst = chklst
		
		#console.log("Begin expand parallel.")
		async.parallel([
						(cb) ->
							if not eChklst.manufacturer?
								cb(null)
								return
								
							db.AircraftManufacturer.findById(eChklst.manufacturer)
								.exec((err, mfr) ->
									if err?
										cb(err)
									if not mfr?
										cb('Not Found')
									
									eChklst.manufacturer = mfr.toObject()
									cb(null)
								)
						,
						(cb) ->
							if not eChklst.model?
								cb(null)
								return
								
							db.AircraftModel.findById(eChklst.model)
								.exec((err, mdl) ->
									if err?
										cb(err)
									if not mdl?
										cb('Not Found')
									
									eChklst.model = mdl.toObject()
									cb(null)
								)
					],
					(err, results) ->
					
						if err?
							callback(err, null)
							return
							
						#console.log("End expand parallel.")
						callback(null, eChklst)
		)
						
	###
	Performs deep property population on an array of {AircraftChecklistSchemaInternal} objects.
	@param arrChkLists [Array<AircraftChecklistSchemaInternal>] The array of objects to deeply populate.
	@param callback [Function] A function meeting the {Callbacks#managerExpandArrayCallback} requirements. 
	###
	expandAll: (arrChkLists, callback) =>
		if not arrChkLists?
			callback('Array cannot be a null reference', null)
		
		eArrChkLists = []
		
		#console.log("Begin expand all")
		
		#console.log("Begin forEach expand")
		async.forEach(arrChkLists, 
			(item, cb) =>
				#console.log("Dipping to expand")
				@.expand(item, (err, newItem) ->
					if err?
						 cb(err)
						 return
					
					#console.log("Dip expand complete")
					eArrChkLists.push(newItem)
					cb(null)
				)
			,
			(err) ->
				if err?
					callback(err, null)
					return
				
				#console.log("End forEach expand")
				callback(null, eArrChkLists)
		)
module.exports = ChecklistManager