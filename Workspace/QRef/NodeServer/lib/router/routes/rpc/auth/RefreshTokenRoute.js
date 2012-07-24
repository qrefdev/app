(function() {
  var RefreshTokenRoute, RpcResponse, RpcRoute, UserAuth,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  RpcRoute = require('../../../RpcRoute');

  RpcResponse = require('../../../../serialization/RpcResponse');

  UserAuth = require('../../../../security/UserAuth');

  RefreshTokenRoute = (function(_super) {

    __extends(RefreshTokenRoute, _super);

    function RefreshTokenRoute() {
      this.post = __bind(this.post, this);
      RefreshTokenRoute.__super__.constructor.call(this, [
        {
          method: 'POST',
          path: '/refreshToken'
        }, {
          method: 'GET',
          path: '/refreshToken'
        }
      ]);
    }

    RefreshTokenRoute.prototype.post = function(req, res) {
      var resp;
      if (!this.isValidRequest(req)) {
        resp = new RpcResponse(null);
        resp.failure('Bad Request', 400);
        res.json(resp, 200);
        return;
      }
      return UserAuth.refreshToken(req.body.token, function(err, success) {
        resp = null;
        if (err != null) {
          resp = new RpcResponse(null);
          resp.failure(err, 500);
          return res.json(resp, 200);
        } else if (!success) {
          resp = new RpcResponse(null);
          resp.failure('Forbidden', 403);
          return res.json(resp, 200);
        } else {
          resp = new RpcResponse(req.body.token);
          return res.json(resp, 200);
        }
      });
    };

    RefreshTokenRoute.prototype.isValidRequest = function(req) {
      var _ref, _ref1;
      if ((req.body != null) && (((_ref = req.body) != null ? _ref.mode : void 0) != null) && req.body.mode === 'rpc' && (((_ref1 = req.body) != null ? _ref1.token : void 0) != null)) {
        return true;
      } else {
        return false;
      }
    };

    return RefreshTokenRoute;

  })(RpcRoute);

  module.exports = new RefreshTokenRoute();

}).call(this);
