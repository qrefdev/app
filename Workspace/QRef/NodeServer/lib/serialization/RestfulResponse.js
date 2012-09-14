
/*
The response object returned for all RESTful requests. 
This response object supports pagination and returning the total available records using the {#setTotal} method.

@example Reporting a Failure
  response = new RestfulResponse()
  response.failure('Some failure reason', 500)
	
@example Returning Data [Single Object]
  response = new RestfulResponse()
  response.addRecord(someObj)
  response.setTotal(1)

@example Returning Data [Array of Objects]
  response = new RestfulResponse()
  response.addRecords(someArray)
  response.setTotal(someCount)

@example Reset to Default
  response = new RestfulResponse()
  response.addRecords(someArray)
  response.reset()
	
@example Count Objects in Response
  response = new RestfulResponse()
  response.addRecords(someArray)
  myCount = response.getLength()

  
@author Nathan Klick
@copyright QRef 2012
*/


(function() {
  var RestfulResponse;

  RestfulResponse = (function() {
    /*
    	@property [Number] (Required) The total number of records available.
    */

    RestfulResponse.prototype.total = 0;

    /*
    	@property [Array<Object>] (Required) The records returned from the server.
    */


    RestfulResponse.prototype.records = [];

    /*
    	@property [Boolean] (Required) A boolean value indicating whether the request was successful. True if the request succeeded, false otherwise.
    */


    RestfulResponse.prototype.success = true;

    /*
    	@property [String] (Required) The type of request being responded to by the server. Will always be "rest".
    */


    RestfulResponse.prototype.mode = 'rest';

    /*
    	@property [Mixed] (Required) A string or object containing an error message from a server side failure.
    */


    RestfulResponse.prototype.message = null;

    /*
    	@property [Number] (Required) An error code returned from the server indicating failure. Will always be a standard HTTP error code (4xx, 5xx).
    */


    RestfulResponse.prototype.errorCode = 0;

    /*
    	Contructs a new RestfulResponse object and calls the {#reset} method.
    */


    function RestfulResponse() {
      this.reset();
    }

    /*
    	Sets the total number of available records when using pagination on a request. 
    	@param value [Number] The total number of available records.
    */


    RestfulResponse.prototype.setTotal = function(value) {
      return this.total = value;
    };

    /*
    	Add a single object to the records associated with this response.
    	@param r [Object] The record to add to the response.
    */


    RestfulResponse.prototype.addRecord = function(r) {
      this.records.push(r);
      return this.records.length;
    };

    /*
    	Appends an array of objects to the response.
    	@param arr [Array<Object>] The array of objects to append to this response.
    */


    RestfulResponse.prototype.addRecords = function(arr) {
      this.records = this.records.concat(arr);
      return this.records.length;
    };

    /*
    	Resets the AjaxResponse object to its default state.
    */


    RestfulResponse.prototype.reset = function() {
      this.records = [];
      this.message = null;
      this.success = true;
      this.mode = 'rest';
      this.total = 0;
      this.errorCode = 0;
      return this.records.length;
    };

    /*
    	Returns the total number of objects contained in this response.
    	@return [Number] The total number of objects in this response.
    */


    RestfulResponse.prototype.getLength = function() {
      return this.records.length;
    };

    /*
    	Sets this response to a failed state by setting the success property to false and assigning the message and errorCode properties.
    	@param reason [Mixed] The string or object to be set as the message property. 
    	@param errorCode [Number] The standard HTTP error code to return in the errorCode property.
    */


    RestfulResponse.prototype.failure = function(reason, errorCode) {
      this.message = reason;
      this.success = false;
      return this.errorCode = errorCode;
    };

    return RestfulResponse;

  })();

  module.exports = RestfulResponse;

}).call(this);
