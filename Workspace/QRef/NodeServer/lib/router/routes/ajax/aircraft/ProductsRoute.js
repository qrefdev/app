(function() {
  var AjaxResponse, AjaxRoute, ProductsRoute, QRefDatabase, UserAuth,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AjaxRoute = require('../../../AjaxRoute');

  AjaxResponse = require('../../../../serialization/AjaxResponse');

  UserAuth = require('../../../../security/UserAuth');

  QRefDatabase = require('../../../../db/QRefDatabase');

  ProductsRoute = (function(_super) {

    __extends(ProductsRoute, _super);

    function ProductsRoute() {
      this.post = __bind(this.post, this);

      this.get = __bind(this.get, this);
      ProductsRoute.__super__.constructor.call(this, [
        {
          method: 'POST',
          path: '/products'
        }, {
          method: 'GET',
          path: '/products'
        }
      ]);
    }

    ProductsRoute.prototype.get = function(req, res) {
      var db, resp, token;
      if (!this.isValidRequest(req)) {
        resp = new AjaxResponse();
        resp.failure('Bad Request', 400);
        res.json(resp, 200);
        return;
      }
      db = QRefDatabase.instance();
      token = req.param('token');
      return UserAuth.validateToken(token, function(err, isTokenValid) {
        var query, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
        if ((err != null) || !isTokenValid === true) {
          resp = new AjaxResponse();
          resp.failure('Not Authorized', 403);
          res.json(resp, 200);
          return;
        }
        query = db.Product.find();
        query = query.where('productCategory').equals('aviation');
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
          return db.Product.where('productCategory').equals('aviation').count(function(err, count) {
            if (err != null) {
              resp = new AjaxResponse();
              resp.failure('Internal Error', 500);
              res.json(resp, 200);
              return;
            }
            resp = new AjaxResponse();
            resp.addRecords(arrObjs);
            resp.setTotal(count);
            return res.json(resp, 200);
          });
        });
      });
    };

    ProductsRoute.prototype.post = function(req, res) {
      var db, resp, token;
      if (!this.isValidRequest(req)) {
        resp = new AjaxResponse();
        resp.failure('Bad Request', 400);
        res.json(resp, 200);
        return;
      }
      db = QRefDatabase.instance();
      token = req.param('token');
      return UserAuth.validateToken(token, function(err, isTokenValid) {
        var newObj, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
        if ((err != null) || !isTokenValid === true) {
          resp = new AjaxResponse();
          resp.failure('Not Authorized', 403);
          res.json(resp, 200);
          return;
        }
        newObj = new db.Product();
        newObj.name = req.body.name;
        newObj.productType = req.body.productType;
        if (((_ref = req.body) != null ? _ref.productCategory : void 0) != null) {
          newObj.productCategory = req.body.productCategory;
        } else {
          newObj.productCategory = 'aviation';
        }
        if (((_ref1 = req.body) != null ? _ref1.isPublished : void 0) != null) {
          newObj.isPublished = req.body.isPublished;
        }
        if (((_ref2 = req.body) != null ? _ref2.appleProductIdentifier : void 0) != null) {
          newObj.appleProductIdentifier = req.body.appleProductIdentifier;
        }
        if (((_ref3 = req.body) != null ? _ref3.androidProductIdentifier : void 0) != null) {
          newObj.androidProductIdentifier = req.body.androidProductIdentifier;
        }
        if (((_ref4 = req.body) != null ? _ref4.isAppleEnabled : void 0) != null) {
          newObj.isAppleEnabled = req.body.isAppleEnabled;
        }
        if (((_ref5 = req.body) != null ? _ref5.isAndroidEnabled : void 0) != null) {
          newObj.isAndroidEnabled = req.body.isAndroidEnabled;
        }
        if (((_ref6 = req.body) != null ? _ref6.suggestedRetailPrice : void 0) != null) {
          newObj.suggestedRetailPrice = req.body.suggestedRetailPrice;
        }
        if (((_ref7 = req.body) != null ? _ref7.aircraftChecklist : void 0) != null) {
          newObj.aircraftChecklist = req.body.aircraftChecklist;
        }
        return newObj.save(function(err) {
          if (err != null) {
            resp = new AjaxResponse();
            resp.failure(err, 500);
            res.json(resp, 200);
            return;
          }
          resp = new AjaxResponse();
          resp.addRecord(newObj);
          resp.setTotal(1);
          return res.json(resp, 200);
        });
      });
    };

    ProductsRoute.prototype.isValidRequest = function(req) {
      var _ref, _ref1, _ref2, _ref3, _ref4;
      if (((req.query != null) && (((_ref = req.query) != null ? _ref.token : void 0) != null)) || ((req.body != null) && (((_ref1 = req.body) != null ? _ref1.token : void 0) != null) && (((_ref2 = req.body) != null ? _ref2.name : void 0) != null) && (((_ref3 = req.body) != null ? _ref3.productType : void 0) != null) && (((_ref4 = req.body) != null ? _ref4.mode : void 0) != null) && req.body.mode === 'ajax')) {
        return true;
      } else {
        return false;
      }
    };

    return ProductsRoute;

  })(AjaxRoute);

  module.exports = new ProductsRoute();

}).call(this);
