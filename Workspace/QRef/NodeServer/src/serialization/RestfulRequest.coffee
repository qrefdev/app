###
Base class for all Restful requests. The difference between a restful request and an ajax request is that restful methods support the use of PUT & DELETE verbs. 
The token field is optional by default. 
The token field is required by certain methods and each method will dictate whether or not this field is required.   
@author Nathan Klick
@copyright QRef 2012
@abstract
###
class RestfulRequest
	###
	@property [String] (Required) The type of request. Should always be "rest".
	###
	mode: "rest"
	###
	@property [String] (Optional) The authentication token to include with the request.
	###
	token: null
	###
	Initializes a new RpcRequest object with the provided authentication token and defaults the mode property to 'rest'.
	@param token [String] The authentication token to include in the request.
	###
	constructor: (token) -> 
		@mode = "rest"
		@token = token
	 