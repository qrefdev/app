(function() {
  var Route, Router, fs,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Route = require('./Route');

  fs = require('fs');

  /*
  Provides core request handling functionality and permits the auto-loading of routes at runtime.
  @note Internal Usage Only - Not required outside the express bootstrap script.
  @todo Remove dependency on relative and hard-coded paths.
  @author Nathan Klick
  @copyright QRef 2012
  */


  Router = (function() {
    /*
    	@property [Express] A reference to the current express object instance.
    */

    Router.prototype.express = null;

    /*
    	@property [Array<Route>] The list of routes associated with and loaded by this router instance.
    */


    Router.prototype.routes = [];

    /*
    	Creates a new Router object instance attached to the specific express object instance.
    	@param express [Express] A reference to the current express object instance.
    */


    function Router(express) {
      this.express = express;
    }

    /*
    	Accessor method for retrieving the current express object instance.
    	@return [Express] The express object instance.
    */


    Router.prototype.getExpress = function() {
      return this.express;
    };

    /*
    	Adds a new {Route} to the list of routes associated with this {Router}.
    	@param route [Route] The route to be associated with this Router.
    	@return [Boolean] True on success, false otherwise.
    */


    Router.prototype.registerRoute = function(route) {
      if ((route != null) && !(__indexOf.call(this.routes, route) >= 0)) {
        this.routes.push(route);
      }
      return true;
    };

    /*
    	Installs the {Route} objects associated with this router into the express runtime.
    */


    Router.prototype.setup = function() {
      var m, rt, _i, _j, _len, _len1, _ref, _ref1;
      console.log('Router: Route Count ' + this.routes.length);
      _ref = this.routes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rt = _ref[_i];
        _ref1 = rt.getMethods();
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          m = _ref1[_j];
          console.log('Setup Route: ' + m.method + ' ' + m.path);
          if (m.method === 'GET') {
            this.express.get(m.path, rt.get);
            console.log('Install Route: GET ' + m.path);
          } else if (m.method === 'POST') {
            this.express.post(m.path, rt.post);
            console.log('Install Route: POST ' + m.path);
          } else if (m.method === 'PUT') {
            this.express.put(m.path, rt.put);
            console.log('Install Route: PUT ' + m.path);
          } else if (m.method === 'DELETE') {
            this.express.del(m.path, rt.del);
            console.log('Install Route: DELETE ' + m.path);
          }
        }
      }
      return true;
    };

    /*
    	Dynamically loads the {Route} objects into the router from the 'routes' sub-directory.
    */


    Router.prototype.load = function() {
      return this.internalLoadDirectory('./lib/router/routes', './routes', '/services');
    };

    /*
    	@private
    */


    Router.prototype.internalLoadDirectory = function(path, requirePath, webPath) {
      var e, entries, m, route, stats, _i, _j, _len, _len1, _ref;
      entries = fs.readdirSync(path);
      for (_i = 0, _len = entries.length; _i < _len; _i++) {
        e = entries[_i];
        stats = fs.statSync(this.combinePath(path, e));
        if (stats.isFile() && !(e.indexOf('.js') === -1)) {
          route = require(this.combinePath(requirePath, e));
          _ref = route.getMethods();
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            m = _ref[_j];
            m.path = this.combinePath(webPath, m.path);
          }
          this.registerRoute(route);
        } else if (stats.isDirectory()) {
          this.internalLoadDirectory(this.combinePath(path, e), this.combinePath(requirePath, e), this.combinePath(webPath, e));
        }
      }
      return true;
    };

    /*
    	@private
    */


    Router.prototype.combinePath = function(path1, path2) {
      if (!(path1.lastIndexOf('/') === path1.length - 1)) {
        path1 = path1 + '/';
      }
      if (path2.indexOf('/') === 0) {
        path2 = path2.slice(1, path2.length);
      }
      return path1 + path2;
    };

    return Router;

  })();

  module.exports = Router;

}).call(this);
