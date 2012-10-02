###
Rudimentary dictionary support class. 
@author Nathan Klick
@copyright QRef 2012
###
class Dictionary
	###
	@property [Object] The object containing the dictionary elements (key/value pairs). This object is treated like an associative array.
	###
	elements: null
	###
	Creates a new {Dictionary} object and initializes the elements object.
	###
	constructor: () ->
		@elements = {}
	###
	Determines if the dictionary contains the given key.
	@param key [Mixed] The dictionary key for which to determine existance.
	@return [Boolean] True if the Dictionary contains the key; false otherwise.
	###
	containsKey: (key) ->
		return true for k in Object.keys(@elements) when k is key
		return false
	###
	Returns the value for a given key.
	@param key [Mixed] The dictionary key for which to retrieve the associated value.
	@return [Mixed] The value associated with the given key.
	###
	get: (key) -> 
		if @.containsKey(key)
 			return @elements[key]
		else
 			return null
 	###
 	Adds or updates the value for a given key.
 	@param key [Mixed] The dictionary key to add or update.
 	@param value [Mixed] The value to associate with the given key.
 	###
	set: (key, value) ->
		@elements[key] = value
module.exports = Dictionary