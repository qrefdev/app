(function() {
  var AjaxResponse, AjaxRoute, QRefDatabase, UserAuth, UserProductsRoute,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AjaxRoute = require('../../../AjaxRoute');

  AjaxResponse = require('../../../../serialization/AjaxResponse');

  UserAuth = require('../../../../security/UserAuth');

  QRefDatabase = require('../../../../db/QRefDatabase');

  UserProductsRoute = (function(_super) {

    __extends(UserProductsRoute, _super);

    function UserProductsRoute() {
      this.post = __bind(this.post, this);

      this.get = __bind(this.get, this);
      UserProductsRoute.__super__.constructor.call(this, [
        {
          method: 'POST',
          path: ':userId/products'
        }, {
          method: 'GET',
          path: ':userId/products'
        }
      ]);
    }

    UserProductsRoute.prototype.get = function(req, res) {
      var db, resp, token, userId;
      if (!this.isValidRequest(req)) {
        resp = new AjaxResponse();
        resp.failure('Bad Request', 400);
        res.json(resp, 200);
        return;
      }
      db = QRefDatabase.instance();
      token = req.param('token');
      userId = req.params.userId;
      return UserAuth.validateToken(token, function(err, isTokenValid) {
        if ((err != null) || !isTokenValid === true) {
          resp = new AjaxResponse();
          resp.failure('Not Authorized', 403);
          res.json(resp, 200);
          return;
        }
        return db.User.findById(userId, function(err, usr) {
          var query, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
          if (err != null) {
            resp = new AjaxResponse();
            resp.failure(err, 500);
            res.json(resp, 200);
            return;
          }
          if (!(usr != null)) {
            resp = new AjaxResponse();
            resp.failure('Not Found', 404);
            res.json(resp, 200);
            return;
          }
          query = db.UserProduct.find();
          query = query.where('user').equals(userId).populate('product');
          if ((((_ref = req.query) != null ? _ref.pageSize : void 0) != null) && (((_ref1 = req.query) != null ? _ref1.page : void 0) != null)) {
            query = query.skip(req.query.page * req.query.pageSize).limit(req.query.pageSize);
          } else if ((((_ref2 = req.query) != null ? _ref2.pageSize : void 0) != null) && !(((_ref3 = req.query) != null ? _ref3.page : void 0) != null)) {
            query = query.limit(req.query.pageSize);
          } else if (!(((_ref4 = req.query) != null ? _ref4.pageSize : void 0) != null) && (((_ref5 = req.query) != null ? _ref5.page : void 0) != null)) {
            query = query.skip(req.query.page * 25).limit(25);
          }
          return query.exec(function(err, arrObjs) {
            if (err != null) {
              resp = new AjaxResponse();
              resp.failure('Internal Error', 500);
              res.json(resp, 200);
              return;
            }
            return db.UserProduct.where('user').equals(userId).count(function(err, count) {
              var arrProducts, mgr, uProd, _i, _len;
              if (err != null) {
                resp = new AjaxResponse();
                resp.failure('Internal Error', 500);
                res.json(resp, 200);
                return;
              }
              resp = new AjaxResponse();
              arrProducts = [];
              for (_i = 0, _len = arrObjs.length; _i < _len; _i++) {
                uProd = arrObjs[_i];
                arrProducts.push(uProd.product.toObject());
              }
              mgr = new ProductManager();
              return mgr.expandAll(arrProducts, function(err, eArrProducts) {
                if (err != null) {
                  resp.failure(err, 500);
                  res.json(resp, 200);
                  return;
                }
                resp.addRecords(eArrProducts);
                resp.setTotal(count);
                return res.json(resp, 200);
              });
            });
          });
        });
      });
    };

    UserProductsRoute.prototype.post = function(req, res) {
      var resp;
      resp = new AjaxResponse();
      resp.failure('Forbidden', 403);
      res.json(resp, 200);
    };

    UserProductsRoute.prototype.isValidRequest = function(req) {
      var _ref, _ref1;
      if ((req.query != null) && (((_ref = req.query) != null ? _ref.token : void 0) != null) && (((_ref1 = req.params) != null ? _ref1.userId : void 0) != null)) {
        return true;
      } else {
        return false;
      }
    };

    return UserProductsRoute;

  })(AjaxRoute);

  module.exports = new UserProductsRoute();

}).call(this);
