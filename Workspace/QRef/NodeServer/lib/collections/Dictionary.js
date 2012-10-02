
/*
Rudimentary dictionary support class. 
@author Nathan Klick
@copyright QRef 2012
*/


(function() {
  var Dictionary;

  Dictionary = (function() {
    /*
    	@property [Object] The object containing the dictionary elements (key/value pairs). This object is treated like an associative array.
    */

    Dictionary.prototype.elements = null;

    /*
    	Creates a new {Dictionary} object and initializes the elements object.
    */


    function Dictionary() {
      this.elements = {};
    }

    /*
    	Determines if the dictionary contains the given key.
    	@param key [Mixed] The dictionary key for which to determine existance.
    	@return [Boolean] True if the Dictionary contains the key; false otherwise.
    */


    Dictionary.prototype.containsKey = function(key) {
      var k, _i, _len, _ref;
      _ref = Object.keys(this.elements);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        k = _ref[_i];
        if (k === key) {
          return true;
        }
      }
      return false;
    };

    /*
    	Returns the value for a given key.
    	@param key [Mixed] The dictionary key for which to retrieve the associated value.
    	@return [Mixed] The value associated with the given key.
    */


    Dictionary.prototype.get = function(key) {
      if (this.containsKey(key)) {
        return this.elements[key];
      } else {
        return null;
      }
      /*
       	Adds or updates the value for a given key.
       	@param key [Mixed] The dictionary key to add or update.
       	@param value [Mixed] The value to associate with the given key.
      */

    };

    Dictionary.prototype.set = function(key, value) {
      return this.elements[key] = value;
    };

    return Dictionary;

  })();

  module.exports = Dictionary;

}).call(this);
