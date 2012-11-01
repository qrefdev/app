RpcRequest = require('../../../serialization/RpcRequest')
###
Object sent as the body of an HTTP POST request to perform user authentication.
@note The token property is not required when using this method.
@author Nathan Klick
@copyright QRef 2012
###
class AuthorizeAppleProductRequest extends RpcRequest
	###
	@property [ObjectId] Required - The ID of the product for which to authorize a purchase.
	###
	product: null
	###
	@property [String] Required - The base64 encoded receipt block from apple IAP libraries.
	###
	receipt: null
	###
	@property [String] Optional - The tailNumber to assign to the newly created checklist.
	###
	tailNumber: null
module.exports = exports = AuthorizeAppleProductRequest