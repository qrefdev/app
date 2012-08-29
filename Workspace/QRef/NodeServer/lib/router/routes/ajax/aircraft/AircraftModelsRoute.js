(function() {
  var AircraftModelsRoute, AjaxResponse, AjaxRoute, QRefDatabase, UserAuth,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AjaxRoute = require('../../../AjaxRoute');

  AjaxResponse = require('../../../../serialization/AjaxResponse');

  UserAuth = require('../../../../security/UserAuth');

  QRefDatabase = require('../../../../db/QRefDatabase');

  AircraftModelsRoute = (function(_super) {

    __extends(AircraftModelsRoute, _super);

    function AircraftModelsRoute() {
      this.post = __bind(this.post, this);

      this.get = __bind(this.get, this);
      AircraftModelsRoute.__super__.constructor.call(this, [
        {
          method: 'POST',
          path: '/models'
        }, {
          method: 'GET',
          path: '/models'
        }
      ]);
    }

    AircraftModelsRoute.prototype.get = function(req, res) {
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
        query = db.AircraftModel.find();
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
          return db.AircraftModel.count(function(err, count) {
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

    AircraftModelsRoute.prototype.post = function(req, res) {
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
        if ((err != null) || !isTokenValid === true) {
          resp = new AjaxResponse();
          resp.failure('Not Authorized', 403);
          res.json(resp, 200);
          return;
        }
        return db.AircraftManufacturer.findById(req.body.manufacturer, function(err, mfr) {
          var newObj, _ref;
          if (err != null) {
            resp = new AjaxResponse();
            resp.failure(err, 500);
            res.json(resp, 200);
            return;
          }
          if (!(mfr != null)) {
            resp = new AjaxResponse();
            resp.failure('Not Found', 404);
            res.json(resp, 200);
            return;
          }
          newObj = new db.AircraftModel();
          newObj.name = req.body.name;
          newObj.manufacturer = mfr._id;
          if (((_ref = req.body) != null ? _ref.description : void 0) != null) {
            newObj.description = req.body.description;
          }
          return newObj.save(function(err) {
            if (err != null) {
              resp = new AjaxResponse();
              resp.failure(err, 500);
              res.json(resp, 200);
              return;
            }
            mfr.models.push(newObj);
            return mfr.save(function(err) {
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
        });
      });
    };

    AircraftModelsRoute.prototype.isValidRequest = function(req) {
      var _ref, _ref1, _ref2, _ref3, _ref4;
      if (((req.query != null) && (((_ref = req.query) != null ? _ref.token : void 0) != null)) || ((req.body != null) && (((_ref1 = req.body) != null ? _ref1.token : void 0) != null) && (((_ref2 = req.body) != null ? _ref2.name : void 0) != null) && (((_ref3 = req.body) != null ? _ref3.manufacturer : void 0) != null) && (((_ref4 = req.body) != null ? _ref4.mode : void 0) != null) && req.body.mode === 'ajax')) {
        return true;
      } else {
        return false;
      }
    };

    return AircraftModelsRoute;

  })(AjaxRoute);

  module.exports = new AircraftModelsRoute();

}).call(this);
