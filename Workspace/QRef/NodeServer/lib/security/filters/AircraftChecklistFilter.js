(function() {
  var AircraftChecklistFilter, RecordFilter, async,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  RecordFilter = require('../RecordFilter');

  async = require('async');

  AircraftChecklistFilter = (function(_super) {

    __extends(AircraftChecklistFilter, _super);

    function AircraftChecklistFilter(token) {
      AircraftChecklistFilter.__super__.constructor.call(this, token);
    }

    AircraftChecklistFilter.prototype.retrieve = function(record, callback) {
      var canRetrieve,
        _this = this;
      canRetrieve = false;
      return async.series([
        function(cb) {
          if (!(_this.user != null) || !(_this.roles != null)) {
            return _this.resolve(cb);
          } else {
            return cb(null);
          }
        }, function(cb) {
          if (_this.isInRole('Administrators') && !(record.user != null)) {
            canRetrieve = true;
          } else if (_this.isInRole('Users') && record.user === _this.getUser()._id && record.isDeleted === false) {
            canRetrieve = true;
          } else {
            canRetrieve = false;
          }
          return cb(null);
        }
      ], function(err) {
        return callback(err, canRetrieve, record);
      });
    };

    AircraftChecklistFilter.prototype.create = function(callback) {
      var canCreate,
        _this = this;
      canCreate = false;
      return async.series([
        function(cb) {
          if (!(_this.user != null) || !(_this.roles != null)) {
            return _this.resolve(cb);
          } else {
            return cb(null);
          }
        }, function(cb) {
          if (_this.isInRole('Administrators')) {
            canCreate = true;
          } else {
            canCreate = false;
          }
          return cb(null);
        }
      ], function(err) {
        return callback(err, canCreate);
      });
    };

    AircraftChecklistFilter.prototype.update = function(record, callback) {
      var canUpdate,
        _this = this;
      canUpdate = false;
      return async.series([
        function(cb) {
          if (!(_this.user != null) || !(_this.roles != null)) {
            console.log('INFO: filter.update() - User or Role not loaded. Beginning call to filter.resolve()');
            return _this.resolve(cb);
          } else {
            console.log('INFO: filter.update() - User and Role are currently loaded. Stepping into next method in series.');
            return cb(null);
          }
        }, function(cb) {
          if (_this.isInRole('Administrators')) {
            console.log('INFO: filter.update() - User is in the Administrators role. Authorizing update request.');
            canUpdate = true;
          } else if (_this.isInRole('Users') && record.user.toString() === _this.getUser()._id.toString()) {
            console.log('INFO: filter.update() - User in is limited access group and record is owned by the user. Authorizing update request.');
            canUpdate = true;
          } else {
            console.log('INFO: filter.update() - User is not authorized. Denying update request.');
            console.log('INFO: filter.update() - Failure - { isUser: ' + _this.isInRole('Users') + ', isAdministrator: ' + _this.isInRole('Administrators') + ', recordUser: ' + record.user.toString() + ', user: ' + _this.getUser()._id.toString() + ', record: ' + record._id.toString() + ', userName: ' + _this.getUser().userName + ' }');
            canUpdate = false;
          }
          return cb(null);
        }
      ], function(err) {
        if (err != null) {
          console.log('ERROR: filter.update() - Error occurred in process. Dumping error to console.');
          console.log('ERROR: filter.update() - ' + err.toString());
        }
        return callback(err, canUpdate, record);
      });
    };

    AircraftChecklistFilter.prototype["delete"] = function(record, callback) {
      var canDelete,
        _this = this;
      canDelete = false;
      return async.series([
        function(cb) {
          if (!(_this.user != null) || !(_this.roles != null)) {
            return _this.resolve(cb);
          } else {
            return cb(null);
          }
        }, function(cb) {
          if (_this.isInRole('Administrators')) {
            canDelete = true;
          } else if (_this.isInRole('Users') && record.user === _this.getUser()._id) {
            canDelete = true;
          } else {
            canDelete = false;
          }
          return cb(null);
        }
      ], function(err) {
        return callback(err, canDelete, record);
      });
    };

    AircraftChecklistFilter.prototype.constrainQuery = function(query, callback) {
      var _this = this;
      return async.series([
        function(cb) {
          if (!(_this.user != null) || !(_this.roles != null)) {
            return _this.resolve(cb);
          } else {
            return cb(null);
          }
        }, function(cb) {
          if (_this.isInRole('Administrators')) {
            query['user'] = null;
          } else if (_this.isInRole('Users')) {
            query['user'] = _this.user._id;
            query['isDeleted'] = false;
          } else {
            query = null;
          }
          return cb(null);
        }
      ], function(err) {
        return callback(err, query);
      });
    };

    return AircraftChecklistFilter;

  })(RecordFilter);

  module.exports = AircraftChecklistFilter;

}).call(this);
