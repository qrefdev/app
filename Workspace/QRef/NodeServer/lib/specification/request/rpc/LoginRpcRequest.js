(function() {
  var LoginRpcRequest, RpcRequest,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  RpcRequest = require('../../../serialization/RpcRequest');

  /*
  Object sent as the body of an HTTP POST request to perform user authentication.
  @note The token property is not required when using this method.
  @author Nathan Klick
  @copyright QRef 2012
  */


  LoginRpcRequest = (function(_super) {

    __extends(LoginRpcRequest, _super);

    function LoginRpcRequest() {
      return LoginRpcRequest.__super__.constructor.apply(this, arguments);
    }

    /*
    	@property [String] (Required) The username used to perform authentication. This should always be the user's email address.
    */


    LoginRpcRequest.prototype.userName = {
      type: String,
      required: true,
      unique: true
    };

    /*
    	@property [String] (Required) The clear text version of the user's password.
    */


    LoginRpcRequest.prototype.password = {
      type: String,
      required: true
    };

    return LoginRpcRequest;

  })(RpcRequest);

  module.exports = LoginRpcRequest;

}).call(this);
