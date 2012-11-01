RpcRequest = require('../../../serialization/RpcRequest')
###
Object sent as the body of an HTTP POST request to upload a product image.
@note The token property is not required when using this method.
@author Nathan Klick
@copyright QRef 2012
###
class ProductImageRpcRequest extends RpcRequest
	###
	@property [ObjectId] (Required) The product ID of the product to update.
	###
	product: 
		type: String
		required: true
		unique: true
module.exports = ProductImageRpcRequest