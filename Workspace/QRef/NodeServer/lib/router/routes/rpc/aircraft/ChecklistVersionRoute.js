(function() {
  var ChecklistVersionRoute, QRefDatabase, RpcResponse, RpcRoute, UserAuth, async, https,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  RpcRoute = require('../../../RpcRoute');

  QRefDatabase = require('../../../../db/QRefDatabase');

  RpcResponse = require('../../../../serialization/RpcResponse');

  UserAuth = require('../../../../security/UserAuth');

  https = require('https');

  async = require('async');

  /*
  Service route that returns the next available version of a given checklist.
  @example Service Methods (see {ChecklistVersionRpcRequest})
    Request Format: application/json
    Response Format: application/json
    
    POST /services/rpc/aircraft/checklist/version
      @BODY - (Required) ChecklistVersionRpcRequest
      
  	Returns the next available version number in the returnValue field of the response object.
  @author Nathan Klick
  @copyright QRef 2012
  */


  ChecklistVersionRoute = (function(_super) {

    __extends(ChecklistVersionRoute, _super);

    function ChecklistVersionRoute() {
      this.post = __bind(this.post, this);
      ChecklistVersionRoute.__super__.constructor.call(this, [
        {
          method: 'POST',
          path: '/checklist/version'
        }, {
          method: 'GET',
          path: '/checklist/version'
        }
      ]);
    }

    ChecklistVersionRoute.prototype.post = function(req, res) {
      var db, manufacturerId, modelId, resp;
      if (!this.isValidRequest(req)) {
        resp = new RpcResponse(null);
        resp.failure('Bad Request', 400);
        res.json(resp, 200);
        return;
      }
      manufacturerId = req.body.manufacturer;
      modelId = req.body.model;
      db = QRefDatabase.instance();
      return db.AircraftManufacturer.findById(manufacturerId, function(err, mfr) {
        if (err != null) {
          resp = new RpcResponse(null);
          resp.failure('Internal Error', 500);
          res.json(resp, 200);
          return;
        }
        if (!(mfr != null)) {
          resp = new RpcResponse(null);
          resp.failure('Manufacturer Not Found', 404);
          res.json(resp, 200);
          return;
        }
        return db.AircraftModel.findOne().where('_id').equals(modelId).where('manufacturer').equals(mfr._id).exec(function(err, mdl) {
          if (err != null) {
            resp = new RpcResponse(null);
            resp.failure('Internal Error', 500);
            res.json(resp, 200);
            return;
          }
          if (!(mdl != null)) {
            resp = new RpcResponse(null);
            resp.failure('Model Not Found', 404);
            res.json(resp, 200);
            return;
          }
          return db.AircraftChecklist.findOne().where('model').equals(mdl._id).where('manufacturer').equals(mfr._id).where('user').equals(null).sort('-version').exec(function(err, record) {
            if (err != null) {
              resp = new RpcResponse(null);
              resp.failure('Internal Error', 500);
              res.json(resp, 200);
              return;
            }
            if (!(record != null)) {
              resp = new RpcResponse(1);
              res.json(resp, 200);
              return;
            }
            resp = new RpcResponse(record.version + 1);
            return res.json(resp, 200);
          });
        });
      });
    };

    ChecklistVersionRoute.prototype.isValidRequest = function(req) {
      var _ref, _ref1, _ref2;
      if ((req.body != null) && (((_ref = req.body) != null ? _ref.mode : void 0) != null) && req.body.mode === 'rpc' && (((_ref1 = req.body) != null ? _ref1.manufacturer : void 0) != null) && (((_ref2 = req.body) != null ? _ref2.model : void 0) != null)) {
        return true;
      } else {
        return false;
      }
    };

    return ChecklistVersionRoute;

  })(RpcRoute);

  module.exports = new ChecklistVersionRoute();

}).call(this);
