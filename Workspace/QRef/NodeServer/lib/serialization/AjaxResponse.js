
/*
The response object returned for all AJAX requests. 
This response object supports pagination and returning the total available records using the {#setTotal} method.

@example Reporting a Failure
  response = new AjaxResponse()
  response.failure('Some failure reason', 500)
	
@example Returning Data [Single Object]
  response = new AjaxResponse()
  response.addRecord(someObj)
  response.setTotal(1)

@example Returning Data [Array of Objects]
  response = new AjaxResponse()
  response.addRecords(someArray)
  response.setTotal(someCount)

@example Reset to Default
  response = new AjaxResponse()
  response.addRecords(someArray)
  response.reset()
	
@example Count Objects in Response
  response = new AjaxResponse()
  response.addRecords(someArray)
  myCount = response.getLength()

  
@author Nathan Klick
@copyright QRef 2012
*/


(function() {
  var AjaxResponse;

  AjaxResponse = (function() {
    /*
    	@property [Number] (Required) The total number of records available.
    */

    AjaxResponse.prototype.total = 0;

    /*
    	@property [Array<Object>] (Required) The records returned from the server.
    */


    AjaxResponse.prototype.records = [];

    /*
    	@property [Boolean] (Required) A boolean value indicating whether the request was successful. True if the request succeeded, false otherwise.
    */


    AjaxResponse.prototype.success = true;

    /*
    	@property [Mixed] (Required) A string or object containing an error message from a server side failure.
    */


    AjaxResponse.prototype.message = null;

    /*
    	@property [String] (Required) The type of request being responded to by the server. Will always be "ajax".
    */


    AjaxResponse.prototype.mode = 'ajax';

    /*
    	@property [Number] (Required) An error code returned from the server indicating failure. Will always be a standard HTTP error code (4xx, 5xx).
    */


    AjaxResponse.prototype.errorCode = 0;

    /*
    	Contructs a new AjaxResponse object and calls the {#reset} method.
    */


    function AjaxResponse() {
      this.reset();
    }

    /*
    	Sets the total number of available records when using pagination on a request. 
    	@param value [Number] The total number of available records.
    */


    AjaxResponse.prototype.setTotal = function(value) {
      return this.total = value;
    };

    /*
    	Add a single object to the records associated with this response.
    	@param r [Object] The record to add to the response.
    */


    AjaxResponse.prototype.addRecord = function(r) {
      this.records.push(r);
      return this.records.length;
    };

    /*
    	Appends an array of objects to the response.
    	@param arr [Array<Object>] The array of objects to append to this response.
    */


    AjaxResponse.prototype.addRecords = function(arr) {
      this.records = this.records.concat(arr);
      return this.records.length;
    };

    /*
    	Resets the AjaxResponse object to its default state.
    */


    AjaxResponse.prototype.reset = function() {
      this.records = [];
      this.message = null;
      this.success = true;
      this.mode = 'ajax';
      this.errorCode = 0;
      this.total = 0;
      return this.records.length;
    };

    /*
    	Returns the total number of objects contained in this response.
    	@return [Number] The total number of objects in this response.
    */


    AjaxResponse.prototype.getLength = function() {
      return this.records.length;
    };

    /*
    	Sets this response to a failed state by setting the success property to false and assigning the message and errorCode properties.
    	@param reason [Mixed] The string or object to be set as the message property. 
    	@param errorCode [Number] The standard HTTP error code to return in the errorCode property.
    */


    AjaxResponse.prototype.failure = function(reason, errorCode) {
      this.message = reason;
      this.errorCode = errorCode;
      return this.success = false;
    };

    return AjaxResponse;

  })();

  module.exports = AjaxResponse;

}).call(this);
