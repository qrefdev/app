###
Object used by the {Route} class to map HTTP verbs to URL paths.
@author Nathan Klick
@copyright QRef 2012
###
class RouteMethod
	###
	@property [String] The HTTP verb to register. Should be one of ['GET', 'POST', 'PUT', 'DELETE'].
	###
	method: null
	###
	@property [String] The relative path to register for the verb.
	###
	path: null
modules.exports = RouteMethod
	