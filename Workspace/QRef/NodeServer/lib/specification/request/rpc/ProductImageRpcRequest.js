(function() {
  var ProductImageRpcRequest, RpcRequest,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  RpcRequest = require('../../../serialization/RpcRequest');

  /*
  Object sent as the body of an HTTP POST request to upload a product image.
  @note The token property is not required when using this method.
  @author Nathan Klick
  @copyright QRef 2012
  */


  ProductImageRpcRequest = (function(_super) {

    __extends(ProductImageRpcRequest, _super);

    function ProductImageRpcRequest() {
      return ProductImageRpcRequest.__super__.constructor.apply(this, arguments);
    }

    /*
    	@property [ObjectId] (Required) The product ID of the product to update.
    */


    ProductImageRpcRequest.prototype.product = {
      type: String,
      required: true,
      unique: true
    };

    return ProductImageRpcRequest;

  })(RpcRequest);

  module.exports = ProductImageRpcRequest;

}).call(this);
