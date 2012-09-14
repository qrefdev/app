
/*
The response object returned for all RPC requests. 
This response object supports returning a single object or other value as the result of an RPC operation.

@example Reporting a Failure
  response = new RpcResponse(null)
  response.failure('Some failure reason', 500)
	
@example Returning Data [Single Object]
  response = new RpcResponse(someObj)
  
@example Return Data [String Value]
  response = new RpcResponse(someString) 

@example Reset to Default
  response = new RpcResponse(someValue)
  response.reset()
	
@example Setting a non-fatal message
  response = new RpcResponse(someValue)
  response.setMessage(someMessage)
  
@author Nathan Klick
@copyright QRef 2012
*/


(function() {
  var RpcResponse;

  RpcResponse = (function() {
    /*
    	@property [Boolean] (Required) A boolean value indicating whether the request was successful. True if the request succeeded, false otherwise.
    */

    RpcResponse.prototype.success = true;

    /*
    	@property [String] (Required) The type of request being responded to by the server. Will always be "rpc".
    */


    RpcResponse.prototype.mode = 'rpc';

    /*
    	@property [Mixed] (Required) A string or object containing an error message from a server side failure.
    */


    RpcResponse.prototype.message = null;

    /*
    	@property [Number] (Required) An error code returned from the server indicating failure. Will always be a standard HTTP error code (4xx, 5xx).
    */


    RpcResponse.prototype.errorCode = 0;

    /*
    	@property [Mixed] (Required) An object, array, or single value returned as the result of the RPC invocation.
    */


    RpcResponse.prototype.returnValue = null;

    /*
    	Contructs a new RpcResponse object and sets the return value after calling the {#reset} method.
    	@param returnValue [Mixed] The object, array, or value to return with this response.
    */


    function RpcResponse(returnValue) {
      this.reset();
      this.returnValue = returnValue;
    }

    /*
    	Specifies a non-fatal message to be included with the response.
    	@param msg [Mixed] An Object or String value indicating a non-fatal state to be returned with the response.
    */


    RpcResponse.prototype.setMessage = function(msg) {
      return this.message = msg;
    };

    /*
    	Resets the response object to its default state.
    */


    RpcResponse.prototype.reset = function() {
      this.message = null;
      this.success = true;
      this.returnValue = null;
      this.mode = 'rpc';
      return this.errorCode = 0;
    };

    /*
    	Sets this response to a failed state by setting the success property to false and assigning the message and errorCode properties.
    	@param reason [Mixed] The string or object to be set as the message property. 
    	@param errorCode [Number] The standard HTTP error code to return in the errorCode property.
    */


    RpcResponse.prototype.failure = function(reason, errorCode) {
      this.success = false;
      this.errorCode = errorCode;
      return this.message = reason;
    };

    return RpcResponse;

  })();

  module.exports = RpcResponse;

}).call(this);
