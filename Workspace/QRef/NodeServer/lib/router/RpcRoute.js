(function() {
  var Route, RpcResponse, RpcRoute,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Route = require('./Route');

  RpcResponse = require('../serialization/RpcResponse');

  /* 
  A route which only supports RPC operations (HTTP POST).
  @author Nathan Klick
  @copyright QRef 2012
  */


  RpcRoute = (function(_super) {

    __extends(RpcRoute, _super);

    /*
    	Create a new Route object instance and registers the given methods with the router.
    	@param methods [Array<RouteMethod>] The methods to register with the router.
    */


    function RpcRoute(methods) {
      RpcRoute.__super__.constructor.call(this, methods);
    }

    /*
    	Invoked when a GET request is received by the express runtime on the registered URL.
    	@param req [Express.Request] The express request object.
    	@param res [Express.Response] The express response object.
    */


    RpcRoute.prototype.get = function(req, res) {
      var resp;
      resp = new RpcResponse(null);
      resp.failure('Method Not Allowed', 405);
      return res.json(resp, 200);
    };

    /*
    	Invoked when a PUT request is received by the express runtime on the registered URL.
    	@param req [Express.Request] The express request object.
    	@param res [Express.Response] The express response object.
    */


    RpcRoute.prototype.put = function(req, res) {
      var resp;
      resp = new RpcResponse(null);
      resp.failure('Method Not Allowed', 405);
      return res.json(resp, 200);
    };

    /*
    	Invoked when a DELETE request is received by the express runtime on the registered URL.
    	@param req [Express.Request] The express request object.
    	@param res [Express.Response] The express response object.
    */


    RpcRoute.prototype.del = function(req, res) {
      var resp;
      resp = new RpcResponse(null);
      resp.failure('Method Not Allowed', 405);
      return res.json(resp, 200);
    };

    return RpcRoute;

  })(Route);

  module.exports = RpcRoute;

}).call(this);
