(function() {
  var RefreshTokenRpcRequest, RpcRequest,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  RpcRequest = require('../../../serialization/RpcRequest');

  /*
  Object sent as the body of an HTTP POST request to renew an existing authentication token.
  @note The token property is not required when using this method.
  @author Nathan Klick
  @copyright QRef 2012
  */


  RefreshTokenRpcRequest = (function(_super) {

    __extends(RefreshTokenRpcRequest, _super);

    function RefreshTokenRpcRequest() {
      return RefreshTokenRpcRequest.__super__.constructor.apply(this, arguments);
    }

    return RefreshTokenRpcRequest;

  })(RpcRequest);

  module.exports = RefreshTokenRpcRequest;

}).call(this);
