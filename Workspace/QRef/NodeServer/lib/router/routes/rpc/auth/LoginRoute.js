(function() {
  var LoginRoute, RpcResponse, RpcRoute, UserAuth,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  RpcRoute = require('../../../RpcRoute');

  RpcResponse = require('../../../../serialization/RpcResponse');

  UserAuth = require('../../../../security/UserAuth');

  LoginRoute = (function(_super) {

    __extends(LoginRoute, _super);

    function LoginRoute() {
      this.post = __bind(this.post, this);
      LoginRoute.__super__.constructor.call(this, [
        {
          method: 'POST',
          path: '/login'
        }, {
          method: 'GET',
          path: '/login'
        }
      ]);
    }

    LoginRoute.prototype.post = function(req, res) {
      var resp;
      if (!this.isValidRequest(req)) {
        resp = new RpcResponse(null);
        resp.failure('Bad Request', 400);
        res.json(resp, 200);
        return;
      }
      return UserAuth.login(req.body.userName, req.body.password, function(err, token, success) {
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
          resp = new RpcResponse(token);
          return res.json(resp, 200);
        }
      });
    };

    LoginRoute.prototype.isValidRequest = function(req) {
      var _ref, _ref1, _ref2;
      if ((req.body != null) && (((_ref = req.body) != null ? _ref.mode : void 0) != null) && req.body.mode === 'rpc' && (((_ref1 = req.body) != null ? _ref1.userName : void 0) != null) && (((_ref2 = req.body) != null ? _ref2.password : void 0) != null)) {
        return true;
      } else {
        return false;
      }
    };

    return LoginRoute;

  })(RpcRoute);

  module.exports = new LoginRoute();

}).call(this);
