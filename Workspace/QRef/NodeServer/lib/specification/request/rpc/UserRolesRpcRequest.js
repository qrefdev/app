(function() {
  var RpcRequest, UserRolesRpcRequest,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  RpcRequest = require('../../../serialization/RpcRequest');

  /*
  Object sent as the body of an HTTP POST request to retrieve the roles of an user. 
  @note The user property is optional when using this method.
  @author Nathan Klick
  @copyright QRef 2012
  */


  UserRolesRpcRequest = (function(_super) {

    __extends(UserRolesRpcRequest, _super);

    function UserRolesRpcRequest() {
      return UserRolesRpcRequest.__super__.constructor.apply(this, arguments);
    }

    /*
    	@property [ObjectId] (Optional) The user for which to obtain roles. If omitted, the owner of the token is used.
    */


    UserRolesRpcRequest.prototype.user = {
      type: ObjectId,
      required: true
    };

    return UserRolesRpcRequest;

  })(RpcRequest);

  module.exports = UserRolesRpcRequest;

}).call(this);
