
/*
Object used by the {Route} class to map HTTP verbs to URL paths.
@author Nathan Klick
@copyright QRef 2012
*/


(function() {
  var RouteMethod;

  RouteMethod = (function() {

    function RouteMethod() {}

    /*
    	@property [String] The HTTP verb to register. Should be one of ['GET', 'POST', 'PUT', 'DELETE'].
    */


    RouteMethod.prototype.method = null;

    /*
    	@property [String] The relative path to register for the verb.
    */


    RouteMethod.prototype.path = null;

    return RouteMethod;

  })();

  modules.exports = RouteMethod;

}).call(this);
