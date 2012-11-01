RpcRequest = require('../../../serialization/RpcRequest')
###
Object sent as the body of an HTTP POST request to retrieve the roles of an user. 
@note The user property is optional when using this method.
@author Nathan Klick
@copyright QRef 2012
###
class UserRolesRpcRequest extends RpcRequest
	###
	@property [ObjectId] (Optional) The user for which to obtain roles. If omitted, the owner of the token is used.
	###
	user: 
		type: ObjectId
		required: true
	
module.exports = UserRolesRpcRequest