(function() {
  var AircraftModelsByManufacturerRoute, AjaxResponse, AjaxRoute, QRefDatabase, UserAuth,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AjaxRoute = require('../../../AjaxRoute');

  AjaxResponse = require('../../../../serialization/AjaxResponse');

  UserAuth = require('../../../../security/UserAuth');

  QRefDatabase = require('../../../../db/QRefDatabase');

  /*
  Service route that allows the retrieval of all models and the creation of new models.
  @example Service Methods (see {CreateAircraftModelAjaxRequest})
    Request Format: application/json
    Response Format: application/json
    
    GET /services/ajax/aircraft/manufacturers?token=:token
      :token - (Required) A valid authentication token.
      
    Retrieves all models.
    
    POST /services/ajax/aircraft/manufacturers
    	@BODY - (Required) CreateAircraftManufacturerAjaxRequest
    	
    Creates a new aircraft model.
  @author Nathan Klick
  @copyright QRef 2012
  */


  AircraftModelsByManufacturerRoute = (function(_super) {

    __extends(AircraftModelsByManufacturerRoute, _super);

    function AircraftModelsByManufacturerRoute() {
      this.post = __bind(this.post, this);

      this.get = __bind(this.get, this);
      AircraftModelsByManufacturerRoute.__super__.constructor.call(this, [
        {
          method: 'POST',
          path: '/manufacturer/:manufacturerId/models'
        }, {
          method: 'GET',
          path: '/manufacturer/:manufacturerId/models'
        }
      ]);
    }

    AircraftModelsByManufacturerRoute.prototype.get = function(req, res) {
      var db, manufacturerId, resp, token;
      if (!this.isValidRequest(req)) {
        resp = new AjaxResponse();
        resp.failure('Bad Request', 400);
        res.json(resp, 200);
        return;
      }
      db = QRefDatabase.instance();
      token = req.param('token');
      manufacturerId = req.params.manufacturerId;
      return UserAuth.validateToken(token, function(err, isTokenValid) {
        var query, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
        if ((err != null) || !isTokenValid === true) {
          resp = new AjaxResponse();
          resp.failure('Not Authorized', 403);
          res.json(resp, 200);
          return;
        }
        query = db.AircraftModel.find().where('manufacturer', manufacturerId);
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
          return db.AircraftModel.find().where('manufacturer', manufacturerId).count(function(err, count) {
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

    AircraftModelsByManufacturerRoute.prototype.post = function(req, res) {
      var resp;
      resp = new AjaxResponse();
      resp.failure('Bad Request', 400);
      res.json(resp, 200);
    };

    AircraftModelsByManufacturerRoute.prototype.isValidRequest = function(req) {
      var _ref, _ref1;
      if ((req.query != null) && (((_ref = req.query) != null ? _ref.token : void 0) != null) && (((_ref1 = req.params) != null ? _ref1.manufacturerId : void 0) != null)) {
        return true;
      } else {
        return false;
      }
    };

    return AircraftModelsByManufacturerRoute;

  })(AjaxRoute);

  module.exports = new AircraftModelsByManufacturerRoute();

}).call(this);
