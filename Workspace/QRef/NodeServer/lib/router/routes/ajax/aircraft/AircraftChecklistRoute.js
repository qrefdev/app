(function() {
  var AircraftChecklistFilter, AircraftChecklistRoute, AjaxResponse, AjaxRoute, ChecklistManager, QRefDatabase, UserAuth,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AjaxRoute = require('../../../AjaxRoute');

  AjaxResponse = require('../../../../serialization/AjaxResponse');

  UserAuth = require('../../../../security/UserAuth');

  QRefDatabase = require('../../../../db/QRefDatabase');

  ChecklistManager = require('../../../../db/manager/ChecklistManager');

  AircraftChecklistFilter = require('../../../../security/filters/AircraftChecklistFilter');

  /*
  Service route that allows the retrieval and updation of an individual checklist.
  @example Service Methods (see {UpdateAircraftChecklistAjaxRequest})
    Request Format: application/json
    Response Format: application/json
  
    GET /services/ajax/aircraft/checklist/:checklistId
      :checklistId - (Required) The ID of the checklist you wish to retrieve
      
      This method retrieves an individual checklist.
      
    POST /services/ajax/aircraft/checklist/:checklistId
    	:checklistId - (Required) The ID of the checklist you wish to update
    	@BODY - (Required) UpdateAircraftChecklistAjaxRequest
    	
    	This method performs an update on a single checklist.
  @author Nathan Klick
  @copyright QRef 2012
  */


  AircraftChecklistRoute = (function(_super) {

    __extends(AircraftChecklistRoute, _super);

    function AircraftChecklistRoute() {
      this.post = __bind(this.post, this);

      this.get = __bind(this.get, this);
      AircraftChecklistRoute.__super__.constructor.call(this, [
        {
          method: 'POST',
          path: '/checklist/:checklistId'
        }, {
          method: 'GET',
          path: '/checklist/:checklistId'
        }
      ]);
    }

    AircraftChecklistRoute.prototype.get = function(req, res) {
      var checklistId, db, filter, mgr, resp, token;
      if (!this.isValidRequest(req)) {
        resp = new AjaxResponse();
        resp.failure('Bad Request', 400);
        res.json(resp, 200);
        return;
      }
      db = QRefDatabase.instance();
      mgr = new ChecklistManager();
      token = req.param('token');
      checklistId = req.params.checklistId;
      filter = new AircraftChecklistFilter(token);
      return UserAuth.validateToken(token, function(err, isTokenValid) {
        var query;
        if ((err != null) || !isTokenValid === true) {
          resp = new AjaxResponse();
          resp.failure('Not Authorized', 403);
          res.json(resp, 200);
          return;
        }
        query = db.AircraftChecklist.findById(checklistId);
        return query.exec(function(err, obj) {
          if (err != null) {
            resp = new AjaxResponse();
            resp.failure('Internal Error', 500);
            res.json(resp, 200);
            return;
          }
          if (obj != null) {
            return filter.retrieve(obj, function(err, isAllowed, record) {
              if (err != null) {
                resp = new AjaxResponse();
                resp.failure('Internal Error', 500);
                res.json(resp, 200);
                return;
              }
              if (!isAllowed) {
                resp = new AjaxResponse();
                resp.failure('Not Authorized', 403);
                res.json(resp, 200);
                return;
              }
              return mgr.expand(obj, function(err1, item) {
                if (err1 != null) {
                  resp = new AjaxResponse();
                  resp.failure('Internal Error', 500);
                  res.json(resp, 200);
                  return;
                }
                resp = new AjaxResponse();
                resp.addRecord(item);
                resp.setTotal(1);
                res.json(resp, 200);
              });
            });
          } else {
            resp = new AjaxResponse();
            resp.failure('Not Found', 404);
            return res.json(resp, 200);
          }
        });
      });
    };

    AircraftChecklistRoute.prototype.post = function(req, res) {
      var checklistId, db, filter, resp, token;
      if (!this.isValidRequest(req)) {
        resp = new AjaxResponse();
        resp.failure('Bad Request', 400);
        res.json(resp, 200);
        return;
      }
      db = QRefDatabase.instance();
      token = req.param('token');
      checklistId = req.params.checklistId;
      filter = new AircraftChecklistFilter(token);
      return UserAuth.validateToken(token, function(err, isTokenValid) {
        var query;
        if ((err != null) || !isTokenValid === true) {
          resp = new AjaxResponse();
          resp.failure('Not Authorized', 403);
          res.json(resp, 200);
          return;
        }
        query = db.AircraftChecklist.findById(checklistId);
        return query.exec(function(err, obj) {
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
          return filter.update(obj, function(err, isAllowed, record) {
            var _ref, _ref1, _ref2, _ref3, _ref4;
            if (err != null) {
              resp = new AjaxResponse();
              resp.failure(err, 500);
              res.json(resp, 200);
              return;
            }
            if (!isAllowed) {
              resp = new AjaxResponse();
              resp.failure('Not Authorized', 403);
              res.json(resp, 200);
              return;
            }
            obj.manufacturer = req.body.manufacturer;
            obj.model = req.body.model;
            obj.preflight = req.body.preflight;
            obj.takeoff = req.body.takeoff;
            obj.landing = req.body.landing;
            obj.emergencies = req.body.emergencies;
            if (((_ref = req.body) != null ? _ref.tailNumber : void 0) != null) {
              obj.tailNumber = req.body.tailNumber;
            }
            if (((_ref1 = req.body) != null ? _ref1.version : void 0) != null) {
              obj.version = req.body.version;
            }
            if (((_ref2 = req.body) != null ? _ref2.index : void 0) != null) {
              obj.index = req.body.index;
            }
            if (((_ref3 = req.body) != null ? _ref3.productIcon : void 0) != null) {
              obj.productIcon = req.body.productIcon;
            }
            if (((_ref4 = req.body) != null ? _ref4.isDeleted : void 0) != null) {
              obj.isDeleted = req.body.isDeleted;
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
      });
    };

    AircraftChecklistRoute.prototype.isValidRequest = function(req) {
      var _ref, _ref1, _ref10, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      if (((req.query != null) && (((_ref = req.query) != null ? _ref.token : void 0) != null) && (req.params != null) && (((_ref1 = req.params) != null ? _ref1.checklistId : void 0) != null)) || ((req.body != null) && (((_ref2 = req.body) != null ? _ref2.token : void 0) != null) && (req.params != null) && (((_ref3 = req.params) != null ? _ref3.checklistId : void 0) != null) && (((_ref4 = req.body) != null ? _ref4.model : void 0) != null) && (((_ref5 = req.body) != null ? _ref5.manufacturer : void 0) != null) && (((_ref6 = req.body) != null ? _ref6.preflight : void 0) != null) && (((_ref7 = req.body) != null ? _ref7.takeoff : void 0) != null) && (((_ref8 = req.body) != null ? _ref8.landing : void 0) != null) && (((_ref9 = req.body) != null ? _ref9.emergencies : void 0) != null) && (((_ref10 = req.body) != null ? _ref10.mode : void 0) != null) && req.body.mode === 'ajax')) {
        return true;
      } else {
        return false;
      }
    };

    return AircraftChecklistRoute;

  })(AjaxRoute);

  module.exports = new AircraftChecklistRoute();

}).call(this);
