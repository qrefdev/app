(function() {
  var RpcResponse;

  RpcResponse = (function() {

    RpcResponse.prototype.success = true;

    RpcResponse.prototype.mode = 'rpc';

    RpcResponse.prototype.message = null;

    RpcResponse.prototype.errorCode = 0;

    RpcResponse.prototype.returnValue = null;

    function RpcResponse(returnValue) {
      this.reset();
      this.returnValue = returnValue;
    }

    RpcResponse.prototype.setMessage = function(msg) {
      return this.message = msg;
    };

    RpcResponse.prototype.reset = function() {
      this.message = null;
      this.success = true;
      this.returnValue = null;
      this.mode = 'rpc';
      return this.errorCode = 0;
    };

    RpcResponse.prototype.failure = function(reason, errorCode) {
      this.success = false;
      this.errorCode = errorCode;
      return this.message = reason;
    };

    return RpcResponse;

  })();

  module.exports = RpcResponse;

}).call(this);
