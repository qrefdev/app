(function() {
  var QRefDatabase, RecordFilter, async, mongoose,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  mongoose = require('mongoose');

  QRefDatabase = require('../db/QRefDatabase');

  async = require('async');

  RecordFilter = (function() {

    RecordFilter.prototype.token = null;

    RecordFilter.prototype.user = null;

    RecordFilter.prototype.roles = null;

    function RecordFilter(token) {
      this.resolve = __bind(this.resolve, this);
      this.token = token;
    }

    RecordFilter.prototype.filter = function(arrRecords, callback) {
      var arrFilteredRecords,
        _this = this;
      arrFilteredRecords = [];
      return async.forEach(arrRecords, function(item, cb) {
        return _this.retrieve(item, function(err, include, rec) {
          if (err != null) {
            cb(err);
            return;
          }
          if (include) {
            arrFilteredRecords.push(rec);
          }
          return cb(null);
        });
      }, function(err) {
        if (err != null) {
          callback(err, []);
          return;
        }
        return callback(null, arrFilteredRecords);
      });
    };

    RecordFilter.prototype.retrieve = function(record, callback) {
      return callback(null, true, record);
    };

    RecordFilter.prototype.create = function(callback) {
      return callback(null, true);
    };

    RecordFilter.prototype.update = function(record, callback) {
      return callback(null, true, record);
    };

    RecordFilter.prototype["delete"] = function(record, callback) {
      return callback(null, true, record);
    };

    RecordFilter.prototype.constrainQuery = function(query, callback) {
      return callback(null, query);
    };

    RecordFilter.prototype.getToken = function() {
      return this.token;
    };

    RecordFilter.prototype.getRoles = function() {
      return this.roles;
    };

    RecordFilter.prototype.getUser = function() {
      return this.user;
    };

    RecordFilter.prototype.isInRole = function(roleName) {
      var r, _i, _len, _ref;
      if (!this.roles) {
        return false;
      }
      _ref = this.roles;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        r = _ref[_i];
        if (r === roleName) {
          return true;
        }
      }
      return false;
    };

    RecordFilter.prototype.resolve = function(callback) {
      var db,
        _this = this;
      db = QRefDatabase.instance();
      this.roles = [];
      return db.AuthToken.where('token').equals(this.token).populate('user').findOne(function(err, tk) {
        if (err != null) {
          callback(err);
          return;
        }
        if (!(tk != null)) {
          callback(new Error('Token not found'));
          return;
        }
        _this.user = tk.user;
        return async.forEach(tk.user.roles, function(item, cb) {
          return db.Role.findById(item, function(err, role) {
            if (err != null) {
              cb(err);
              return;
            }
            if (!(role != null)) {
              cb(new Error('Role not found'));
              return;
            }
            _this.roles.push(role.roleName);
            return cb(null);
          });
        }, function(err) {
          if (err != null) {
            callback(err);
            return;
          }
          return callback(null);
        });
      });
    };

    return RecordFilter;

  })();

  module.exports = RecordFilter;

}).call(this);
