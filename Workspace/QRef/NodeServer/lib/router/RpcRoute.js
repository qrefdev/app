(function() {
  var Route, RpcResponse, RpcRoute,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Route = require('./Route');

  RpcResponse = require('../serialization/RpcResponse');

  RpcRoute = (function(_super) {

    __extends(RpcRoute, _super);

    function RpcRoute(methods) {
      RpcRoute.__super__.constructor.call(this, methods);
    }

    RpcRoute.prototype.get = function(req, res) {
      var resp;
      resp = new RpcResponse(null);
      resp.failure('Method Not Allowed', 405);
      return res.json(resp, 200);
    };

    RpcRoute.prototype.put = function(req, res) {
      var resp;
      resp = new RpcResponse(null);
      resp.failure('Method Not Allowed', 405);
      return res.json(resp, 200);
    };

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
