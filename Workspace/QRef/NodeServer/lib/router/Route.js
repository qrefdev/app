(function() {
  var Route;

  Route = (function() {

    Route.prototype.methods = [
      {
        method: 'GET',
        path: null
      }, {
        method: 'POST',
        path: null
      }, {
        method: 'PUT',
        path: null
      }, {
        method: 'DELETE',
        path: null
      }
    ];

    function Route(methods) {
      if (methods != null) {
        this.methods = methods;
      }
    }

    Route.prototype.getMethods = function() {
      return this.methods;
    };

    Route.prototype.post = function(req, res) {};

    Route.prototype.get = function(req, res) {};

    Route.prototype.put = function(req, res) {};

    Route.prototype.del = function(req, res) {};

    return Route;

  })();

  module.exports = Route;

}).call(this);
