(function() {
  var ProductCoverRoute, QRefDatabase, RpcResponse, RpcRoute, UserAuth, async, fs, https, mime,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  RpcRoute = require('../../../RpcRoute');

  QRefDatabase = require('../../../../db/QRefDatabase');

  RpcResponse = require('../../../../serialization/RpcResponse');

  UserAuth = require('../../../../security/UserAuth');

  https = require('https');

  async = require('async');

  fs = require('fs-extra');

  mime = require('mime');

  /*
  Service route that saves an uploaded coverImage and returns the final path to image.
  @example Service Methods (see {ProductImageRpcRequest})
    Request Format: application/json
    Response Format: application/json
    
    POST /services/rpc/aircraft/product/cover
      @BODY - (Required) ProductImageRpcRequest
      
  	Returns the next available version number in the returnValue field of the response object.
  @author Nathan Klick
  @copyright QRef 2012
  */


  ProductCoverRoute = (function(_super) {

    __extends(ProductCoverRoute, _super);

    function ProductCoverRoute() {
      this.post = __bind(this.post, this);
      ProductCoverRoute.__super__.constructor.call(this, [
        {
          method: 'POST',
          path: '/product/cover'
        }, {
          method: 'GET',
          path: '/product/cover'
        }
      ]);
    }

    ProductCoverRoute.prototype.post = function(req, res) {
      var db, fileKeys, fsPath, productId, resp, token, webPath;
      if (!this.isValidRequest(req)) {
        resp = new RpcResponse(null);
        resp.failure('Bad Request', 400);
        res.json(resp, 200);
        return;
      }
      db = QRefDatabase.instance();
      fileKeys = Object.keys(req.files);
      token = req.param('token');
      productId = req.body.product;
      fsPath = '/storage/http/qref/WebContent/images/product/covers/';
      webPath = 'images/product/covers/';
      if (fileKeys.length === 0 || fileKeys.length > 1) {
        resp = new RpcResponse(null);
        resp.failure('Bad Request', 400);
        res.json(resp, 200);
        return;
      }
      return db.Product.findById(productId, function(err, product) {
        var ext, file, fileName, slashPos, targetPath, targetWebPath;
        if (err != null) {
          resp = new RpcResponse(null);
          resp.failure(err, 500);
          res.json(resp, 200);
          return;
        }
        if (!(product != null)) {
          resp = new RpcResponse(null);
          resp.failure('Not Found', 404);
          res.json(resp, 200);
          return;
        }
        file = req.files[fileKeys[0]];
        slashPos = file.path.lastIndexOf('/');
        if (slashPos > 0) {
          fileName = file.path.slice(slashPos + 1);
        } else {
          fileName = file.path;
        }
        ext = mime.extension(file.type);
        targetPath = fsPath + file.name;
        targetWebPath = webPath + file.name;
        return fs.copy(file.path, targetPath, function(err) {
          if (err != null) {
            console.log("File System Error { targetPath: '" + targetPath + "', targetWebPath: '" + targetWebPath + "', slashPos: " + slashPos + ", fileName: '" + fileName + "', file.path: '" + file.path + "' }");
            resp = new RpcResponse(null);
            resp.failure(err, 500);
            res.json(resp, 200);
            return;
          }
          product.coverImage = targetWebPath;
          return product.save(function(err) {
            if (err != null) {
              resp = new RpcResponse(null);
              resp.failure(err, 500);
              res.json(resp, 200);
              return;
            }
            return fs.unlink(file.path, function(err) {
              resp = new RpcResponse(targetWebPath);
              res.json(resp, 200);
            });
          });
        });
      });
    };

    ProductCoverRoute.prototype.isValidRequest = function(req) {
      var _ref, _ref1, _ref2;
      if ((req.body != null) && (((_ref = req.body) != null ? _ref.mode : void 0) != null) && req.body.mode === 'rpc' && (((_ref1 = req.body) != null ? _ref1.product : void 0) != null) && (((_ref2 = req.body) != null ? _ref2.token : void 0) != null)) {
        return true;
      } else {
        return false;
      }
    };

    return ProductCoverRoute;

  })(RpcRoute);

  module.exports = new ProductCoverRoute();

}).call(this);
