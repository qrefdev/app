(function() {
  var AjaxResponse, AjaxRoute, ProductManager, ProductRoute, QRefDatabase, UserAuth,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AjaxRoute = require('../../../AjaxRoute');

  AjaxResponse = require('../../../../serialization/AjaxResponse');

  UserAuth = require('../../../../security/UserAuth');

  QRefDatabase = require('../../../../db/QRefDatabase');

  ProductManager = require('../../../../db/manager/ProductManager');

  /*
  Service route that allows the retrieval and updation of an individual product.
  @example Service Methods (see {UpdateAircraftProductAjaxRequest})
    Request Format: application/json
    Response Format: application/json
    
    GET /services/ajax/aircraft/product/:productId
      :productId - (Required) The ID of the product you wish to retrieve
      
      This method retrieves an individual product.
      
    POST /services/ajax/aircraft/product/:productId
    	:productId - (Required) The ID of the product you wish to update
    	@BODY - (Required) UpdateAircraftProductAjaxRequest
    	
    	This method performs an update on a single product.
  @author Nathan Klick
  @copyright QRef 2012
  */


  ProductRoute = (function(_super) {

    __extends(ProductRoute, _super);

    function ProductRoute() {
      this.post = __bind(this.post, this);

      this.get = __bind(this.get, this);
      ProductRoute.__super__.constructor.call(this, [
        {
          method: 'POST',
          path: '/product/:productId'
        }, {
          method: 'GET',
          path: '/product/:productId'
        }
      ]);
    }

    ProductRoute.prototype.get = function(req, res) {
      var db, mgr, productId, resp, token;
      if (!this.isValidRequest(req)) {
        resp = new AjaxResponse();
        resp.failure('Bad Request', 400);
        res.json(resp, 200);
        return;
      }
      db = QRefDatabase.instance();
      token = req.param('token');
      productId = req.params.productId;
      mgr = new ProductManager();
      return UserAuth.validateToken(token, function(err, isTokenValid) {
        var query;
        if ((err != null) || !isTokenValid === true) {
          resp = new AjaxResponse();
          resp.failure('Not Authorized', 403);
          res.json(resp, 200);
          return;
        }
        query = db.Product.findById(productId);
        return query.exec(function(err, obj) {
          if (err != null) {
            resp = new AjaxResponse();
            resp.failure('Internal Error', 500);
            res.json(resp, 200);
            return;
          }
          if (!(obj != null)) {
            resp = new AjaxResponse();
            resp.failure('Not Found', 404);
            res.json(resp, 200);
            return;
          }
          return mgr.expand(obj, function(err, eProduct) {
            if (err != null) {
              resp = new AjaxResponse();
              resp.failure('Internal Error', 500);
              res.json(resp, 200);
              return;
            }
            resp = new AjaxResponse();
            resp.addRecord(eProduct);
            resp.setTotal(1);
            return res.json(resp, 200);
          });
        });
      });
    };

    ProductRoute.prototype.post = function(req, res) {
      var db, productId, resp, token;
      if (!this.isValidRequest(req)) {
        resp = new AjaxResponse();
        resp.failure('Bad Request', 400);
        res.json(resp, 200);
        return;
      }
      db = QRefDatabase.instance();
      token = req.param('token');
      productId = req.params.productId;
      return UserAuth.validateToken(token, function(err, isTokenValid) {
        if ((err != null) || !isTokenValid === true) {
          resp = new AjaxResponse();
          resp.failure('Not Authorized', 403);
          res.json(resp, 200);
          return;
        }
        return db.Product.findById(productId, function(err, obj) {
          var _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
          if (err != null) {
            resp = new AjaxResponse();
            resp.failure(err, 500);
            res.json(resp, 200);
            return;
          }
          if (!(obj != null)) {
            resp = new AjaxResponse();
            resp.failure('Not Found', 404);
            res.json(resp, 200);
            return;
          }
          if (((_ref = req.body) != null ? _ref.name : void 0) != null) {
            obj.name = req.body.name;
          }
          if (((_ref1 = req.body) != null ? _ref1.productType : void 0) != null) {
            obj.productType = req.body.productType;
          }
          if (((_ref2 = req.body) != null ? _ref2.productCategory : void 0) != null) {
            obj.productCategory = req.body.productCategory;
          }
          if (((_ref3 = req.body) != null ? _ref3.isPublished : void 0) != null) {
            obj.isPublished = req.body.isPublished;
          }
          if (((_ref4 = req.body) != null ? _ref4.appleProductIdentifier : void 0) != null) {
            obj.appleProductIdentifier = req.body.appleProductIdentifier;
          }
          if (((_ref5 = req.body) != null ? _ref5.androidProductIdentifier : void 0) != null) {
            obj.androidProductIdentifier = req.body.androidProductIdentifier;
          }
          if (((_ref6 = req.body) != null ? _ref6.isAppleEnabled : void 0) != null) {
            obj.isAppleEnabled = req.body.isAppleEnabled;
          }
          if (((_ref7 = req.body) != null ? _ref7.isAndroidEnabled : void 0) != null) {
            obj.isAndroidEnabled = req.body.isAndroidEnabled;
          }
          if (((_ref8 = req.body) != null ? _ref8.suggestedRetailPrice : void 0) != null) {
            obj.suggestedRetailPrice = req.body.suggestedRetailPrice;
          }
          if (((_ref9 = req.body) != null ? _ref9.aircraftChecklist : void 0) != null) {
            obj.aircraftChecklist = req.body.aircraftChecklist;
          }
          if (((_ref10 = req.body) != null ? _ref10.coverImage : void 0) != null) {
            obj.coverImage = req.body.coverImage;
          }
          if (((_ref11 = req.body) != null ? _ref11.productIcon : void 0) != null) {
            obj.productIcon = req.body.productIcon;
          }
          if (((_ref12 = req.body) != null ? _ref12.serialNumber : void 0) != null) {
            obj.serialNumber = req.body.serialNumber;
          }
          if (((_ref13 = req.body) != null ? _ref13.isSampleProduct : void 0) != null) {
            obj.isSampleProduct = req.body.isSampleProduct;
          }
          if (((_ref14 = req.body) != null ? _ref14.description : void 0) != null) {
            obj.description = req.body.description;
          }
          return obj.save(function(err) {
            if (err != null) {
              resp = new AjaxResponse();
              resp.failure(err, 500);
              res.json(resp, 200);
              return;
            }
            resp = new AjaxResponse();
            resp.addRecord(obj);
            resp.setTotal(1);
            return res.json(resp, 200);
          });
        });
      });
    };

    ProductRoute.prototype.isValidRequest = function(req) {
      var _ref, _ref1, _ref2, _ref3, _ref4;
      if (((req.query != null) && (((_ref = req.query) != null ? _ref.token : void 0) != null) && ((_ref1 = req.params) != null ? _ref1.productId : void 0)) || ((req.body != null) && (((_ref2 = req.body) != null ? _ref2.token : void 0) != null) && (((_ref3 = req.params) != null ? _ref3.productId : void 0) != null) && (((_ref4 = req.body) != null ? _ref4.mode : void 0) != null) && req.body.mode === 'ajax')) {
        return true;
      } else {
        return false;
      }
    };

    return ProductRoute;

  })(AjaxRoute);

  module.exports = new ProductRoute();

}).call(this);
