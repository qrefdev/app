(function() {
  var AircraftChecklistsRoute, AjaxResponse, AjaxRoute, QRefDatabase, UserAuth,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AjaxRoute = require('../../../AjaxRoute');

  AjaxResponse = require('../../../../serialization/AjaxResponse');

  UserAuth = require('../../../../security/UserAuth');

  QRefDatabase = require('../../../../db/QRefDatabase');

  AircraftChecklistsRoute = (function(_super) {

    __extends(AircraftChecklistsRoute, _super);

    function AircraftChecklistsRoute() {
      this.post = __bind(this.post, this);

      this.get = __bind(this.get, this);
      AircraftChecklistsRoute.__super__.constructor.call(this, [
        {
          method: 'POST',
          path: '/checklists'
        }, {
          method: 'GET',
          path: '/checklists'
        }
      ]);
    }

    AircraftChecklistsRoute.prototype.get = function(req, res) {
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
        query = db.AircraftChecklist.find();
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
          return db.AircraftChecklist.count(function(err, count) {
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

    AircraftChecklistsRoute.prototype.post = function(req, res) {
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
        var newObj, _ref, _ref1, _ref2, _ref3, _ref4;
        if ((err != null) || !isTokenValid === true) {
          resp = new AjaxResponse();
          resp.failure('Not Authorized', 403);
          res.json(resp, 200);
          return;
        }
        newObj = new db.AircraftChecklist();
        newObj.manufacturer = req.body.manufacturer;
        newObj.model = req.body.model;
        newObj.preflight = req.body.preflight;
        newObj.takeoff = req.body.takeoff;
        newObj.landing = req.body.landing;
        newObj.emergencies = req.body.emergenices;
        newObj.serialNumber = req.body.serialNumber;
        newObj.modelYear = req.body.modelYear;
        if (((_ref = req.body) != null ? _ref.tailNumber : void 0) != null) {
          newObj.tailNumber = req.body.tailNumber;
        }
        if (((_ref1 = req.body) != null ? _ref1.user : void 0) != null) {
          newObj.user = req.body.user;
        }
        if (((_ref2 = req.body) != null ? _ref2.version : void 0) != null) {
          newObj.version = req.body.version;
        } else {
          newObj.version = 1;
        }
        if (((_ref3 = req.body) != null ? _ref3.productIcon : void 0) != null) {
          newObj.productIcon = req.body.productIcon;
        }
        if (((_ref4 = req.body) != null ? _ref4.coverImage : void 0) != null) {
          newObj.coverImage = req.body.coverImage;
        }
        return newObj.save(function(err) {
          if (err != null) {
            resp = new AjaxResponse();
            resp.failure(err, 500);
            res.json(resp, 200);
            return;
          }
          resp = new AjaxResponse();
          resp.setTotal(1);
          resp.addRecord(newObj);
          return res.json(resp, 200);
        });
      });
    };

    AircraftChecklistsRoute.prototype.isValidRequest = function(req) {
      var _ref, _ref1, _ref10, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      if (((req.query != null) && (((_ref = req.query) != null ? _ref.token : void 0) != null)) || ((req.body != null) && (((_ref1 = req.body) != null ? _ref1.token : void 0) != null) && (((_ref2 = req.body) != null ? _ref2.model : void 0) != null) && (((_ref3 = req.body) != null ? _ref3.manufacturer : void 0) != null) && (((_ref4 = req.body) != null ? _ref4.preflight : void 0) != null) && (((_ref5 = req.body) != null ? _ref5.takeoff : void 0) != null) && (((_ref6 = req.body) != null ? _ref6.landing : void 0) != null) && (((_ref7 = req.body) != null ? _ref7.emergencies : void 0) != null) && ((_ref8 = req.body) != null ? _ref8.modelYear : void 0) && ((_ref9 = req.body) != null ? _ref9.serialNumber : void 0) && (((_ref10 = req.body) != null ? _ref10.mode : void 0) != null) && req.body.mode === 'ajax')) {
        return true;
      } else {
        return false;
      }
    };

    return AircraftChecklistsRoute;

  })(AjaxRoute);

  module.exports = new AircraftChecklistsRoute();

}).call(this);
