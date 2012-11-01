(function() {
  var QRefDatabase, RpcResponse, RpcRoute, UserAuth, UserRolesRoute, async,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  RpcRoute = require('../../../RpcRoute');

  RpcResponse = require('../../../../serialization/RpcResponse');

  UserAuth = require('../../../../security/UserAuth');

  QRefDatabase = require('../../../../db/QRefDatabase');

  async = require('async');

  /*
  Service route that retrieves role membership.
  @example Service Methods (see {UserRolesRpcRequest})
    Request Format: application/json
    Response Format: application/json
    
    POST /services/rpc/auth/userRoles
      @BODY - (Required) UserRolesRpcRequest
      
    Retrieves the roles assigned to a given user or the owner of the token. 
  @author Nathan Klick
  @copyright QRef 2012
  */


  UserRolesRoute = (function(_super) {

    __extends(UserRolesRoute, _super);

    function UserRolesRoute() {
      this.getUserRoles = __bind(this.getUserRoles, this);

      this.post = __bind(this.post, this);
      UserRolesRoute.__super__.constructor.call(this, [
        {
          method: 'POST',
          path: '/userRoles'
        }, {
          method: 'GET',
          path: '/userRoles'
        }
      ]);
    }

    UserRolesRoute.prototype.post = function(req, res) {
      var resp, token,
        _this = this;
      if (!this.isValidRequest(req)) {
        resp = new RpcResponse(null);
        resp.failure('Bad Request', 400);
        res.json(resp, 200);
        return;
      }
      token = req.body.token;
      return UserAuth.userFromToken(token, function(err, user) {
        var userId, _ref;
        if ((err != null) || !(user != null)) {
          resp = new RpcResponse(null);
          resp.failure('Forbidden', 403);
          res.json(resp, 200);
          return;
        }
        userId = null;
        if (((_ref = req.body) != null ? _ref.user : void 0) != null) {
          userId = req.body.user;
        } else {
          userId = user._id;
        }
        return _this.getUserRoles(userId, function(err, roles) {
          if (err != null) {
            resp = new RpcResponse(null);
            resp.failure(err, 500);
            res.json(resp, 200);
            return;
          }
          resp = new RpcResponse(roles);
          res.json(resp, 200);
        });
      });
    };

    UserRolesRoute.prototype.getUserRoles = function(userId, callback) {
      var db;
      db = QRefDatabase.instance();
      return db.User.findById(userId, function(err, user) {
        var roleNames;
        if (err != null) {
          callback(err, []);
          return;
        }
        if (!(user != null)) {
          callback(new Error("User was not found."), []);
          return;
        }
        roleNames = [];
        return async.forEach(user.roles, function(item, cb) {
          return db.Role.findById(item, function(err, role) {
            if (err != null) {
              cb(err);
              return;
            }
            if (!(role != null)) {
              cb(null);
              return;
            }
            roleNames.push(role.roleName);
            return cb(null);
          });
        }, function(err) {
          if (err != null) {
            callback(err, []);
            return;
          }
          return callback(null, roleNames);
        });
      });
    };

    UserRolesRoute.prototype.isValidRequest = function(req) {
      var _ref, _ref1;
      if ((req.body != null) && (((_ref = req.body) != null ? _ref.mode : void 0) != null) && req.body.mode === 'rpc' && (((_ref1 = req.body) != null ? _ref1.token : void 0) != null)) {
        return true;
      } else {
        return false;
      }
    };

    return UserRolesRoute;

  })(RpcRoute);

  module.exports = new UserRolesRoute();

}).call(this);
