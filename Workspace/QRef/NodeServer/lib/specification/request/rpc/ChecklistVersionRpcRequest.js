(function() {
  var ChecklistVersionRpcRequest, RpcRequest, exports,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  RpcRequest = require('../../../serialization/RpcRequest');

  /*
  Object sent as the body of an HTTP POST request to perform user authentication.
  @author Nathan Klick
  @copyright QRef 2012
  */


  ChecklistVersionRpcRequest = (function(_super) {

    __extends(ChecklistVersionRpcRequest, _super);

    function ChecklistVersionRpcRequest() {
      return ChecklistVersionRpcRequest.__super__.constructor.apply(this, arguments);
    }

    /*
    	@property [ObjectId] Required - The ID of the manufacturer for which for acquire the version information.
    */


    ChecklistVersionRpcRequest.prototype.manufacturer = null;

    /*
    	@property [ObjectId] Required - The ID of the model for which to acquire the version information.
    */


    ChecklistVersionRpcRequest.prototype.model = null;

    return ChecklistVersionRpcRequest;

  })(RpcRequest);

  module.exports = exports = ChecklistVersionRpcRequest;

}).call(this);
