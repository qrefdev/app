(function() {
  var AircraftChecklistsByModelRoute, AjaxResponse, AjaxRoute, QRefDatabase, UserAuth,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AjaxRoute = require('../../../AjaxRoute');

  AjaxResponse = require('../../../../serialization/AjaxResponse');

  UserAuth = require('../../../../security/UserAuth');

  QRefDatabase = require('../../../../db/QRefDatabase');

  /*
  Service route that allows the retrieval of all checklists for a given manufacturer and model.
  @example Service Methods (see {CreateAircraftChecklistAjaxRequest})
    Request Format: application/json
    Response Format: application/json
    
    GET /services/ajax/aircraft/checklist/manufacturer/:manufacturerId/model/:modelId?token=:token
      :manufacturerId - (Required) The Id of a manufacturer.
      :modelId - (Required) The Id of a model.
      :token - (Required) A valid authentication token.
      
    Retrieves all checklists for the given manufacturer and model.
  @author Nathan Klick
  @copyright QRef 2012
  */


  AircraftChecklistsByModelRoute = (function(_super) {

    __extends(AircraftChecklistsByModelRoute, _super);

    function AircraftChecklistsByModelRoute() {
      this.post = __bind(this.post, this);

      this.get = __bind(this.get, this);
      AircraftChecklistsByModelRoute.__super__.constructor.call(this, [
        {
          method: 'POST',
          path: '/checklist/manufacturer/:manufacturerId/model/:modelId'
        }, {
          method: 'GET',
          path: '/checklist/manufacturer/:manufacturerId/model/:modelId'
        }
      ]);
    }

    AircraftChecklistsByModelRoute.prototype.get = function(req, res) {
      var checklistId, db, mdl, mfg, resp, token;
      if (!this.isValidRequest(req)) {
        resp = new AjaxResponse();
        resp.failure('Bad Request', 400);
        res.json(resp, 200);
        return;
      }
      db = QRefDatabase.instance();
      token = req.param('token');
      mfg = req.params.manufacturerId;
      mdl = req.params.modelId;
      checklistId = req.params.checklistId;
      return UserAuth.validateToken(token, function(err, isTokenValid) {
        var query;
        if ((err != null) || !isTokenValid === true) {
          resp = new AjaxResponse();
          resp.failure('Not Authorized', 403);
          res.json(resp, 200);
          return;
        }
        query = db.AircraftChecklist.find({
          model: mdl,
          manufacturer: mfg,
          user: null,
          isDeleted: false
        });
        return query.exec(function(err, arrObjs) {
          if (err != null) {
            resp = new AjaxResponse();
            resp.failure('Internal Error', 500);
            res.json(resp, 200);
            return;
          }
          if (arrObjs.length > 0) {
            resp = new AjaxResponse();
            resp.addRecords(arrObjs);
            resp.setTotal(arrObjs.length);
            return res.json(resp, 200);
          } else {
            resp = new AjaxResponse();
            resp.failure('Not Found', 404);
            return res.json(resp, 200);
          }
        });
      });
    };

    AircraftChecklistsByModelRoute.prototype.post = function(req, res) {
      var resp;
      resp = new AjaxResponse();
      resp.failure('Not Found', 404);
      res.json(resp, 200);
    };

    AircraftChecklistsByModelRoute.prototype.isValidRequest = function(req) {
      var _ref, _ref1, _ref2;
      if ((req.query != null) && (((_ref = req.query) != null ? _ref.token : void 0) != null) && (req.params != null) && (((_ref1 = req.params) != null ? _ref1.modelId : void 0) != null) && (((_ref2 = req.params) != null ? _ref2.manufacturerId : void 0) != null)) {
        return true;
      } else {
        return false;
      }
    };

    return AircraftChecklistsByModelRoute;

  })(AjaxRoute);

  module.exports = new AircraftChecklistsByModelRoute();

}).call(this);
