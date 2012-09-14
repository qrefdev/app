
/*
Base class for all AJAX requests. The token field is optional by default. 
The token field is required by certain methods and each method will dictate whether or not this field is required.   
@author Nathan Klick
@copyright QRef 2012
@abstract
*/


(function() {
  var AjaxRequest;

  AjaxRequest = (function() {
    /*
    	@property [String] (Required) The type of request. Should always be "ajax".
    */

    AjaxRequest.prototype.mode = "ajax";

    /*
    	@property [String] (Optional) The authentication token to include with the request.
    */


    AjaxRequest.prototype.token = null;

    /*
    	Initializes a new AjaxRequest object with the provided authentication token and defaults the mode property to 'ajax'.
    	@param token [String] The authentication token to include in the request.
    */


    function AjaxRequest(token) {
      this.mode = "ajax";
      this.token = token;
    }

    return AjaxRequest;

  })();

}).call(this);
