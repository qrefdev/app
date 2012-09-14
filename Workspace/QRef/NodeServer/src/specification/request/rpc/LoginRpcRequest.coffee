RpcRequest = require('../../../serialization/RpcRequest')
###
Object sent as the body of an HTTP POST request to perform user authentication.
@note The token property is not required when using this method.
@author Nathan Klick
@copyright QRef 2012
###
class LoginRpcRequest extends RpcRequest
	###
	@property [String] (Required) The username used to perform authentication. This should always be the user's email address.
	###
	userName: 
		type: String
		required: true
		unique: true
	###
	@property [String] (Required) The clear text version of the user's password.
	###
	password: 
		type: String
		required: true
module.exports = LoginRpcRequest