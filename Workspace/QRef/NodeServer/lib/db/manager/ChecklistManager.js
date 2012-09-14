(function() {
  var ChecklistManager, QRefDatabase, async, mongoose,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  async = require('async');

  mongoose = require('mongoose');

  QRefDatabase = require('../QRefDatabase');

  /*
  Utility class used to provide common operations on {AircraftChecklistSchemaInternal} object instances.
  @author Nathan Klick
  @copyright QRef 2012
  */


  ChecklistManager = (function() {
    /*
    	Creates a new instance of the ChecklistManager class.
    */

    function ChecklistManager() {
      this.expandAll = __bind(this.expandAll, this);

    }

    /*
    	Performs deep property population on a single {AircraftChecklistSchemaInternal} object.
    	@param chklst [AircraftChecklistSchemaInternal] The object to deeply populate.
    	@param callback [Function] A function meeting the {Callbacks#managerExpandItemCallback} requirements.
    */


    ChecklistManager.prototype.expand = function(chklst, callback) {
      var db, eChklst;
      db = QRefDatabase.instance();
      if (!(chklst != null)) {
        callback('Checklist cannot be null', null);
        return;
      }
      if (chklst.toObject != null) {
        eChklst = chklst.toObject();
      } else {
        eChklst = chklst;
      }
      return async.parallel([
        function(cb) {
          if (!(eChklst.manufacturer != null)) {
            cb(null);
            return;
          }
          return db.AircraftManufacturer.findById(eChklst.manufacturer).exec(function(err, mfr) {
            if (err != null) {
              cb(err);
            }
            if (!(mfr != null)) {
              cb('Not Found');
            }
            eChklst.manufacturer = mfr.toObject();
            return cb(null);
          });
        }, function(cb) {
          if (!(eChklst.model != null)) {
            cb(null);
            return;
          }
          return db.AircraftModel.findById(eChklst.model).exec(function(err, mdl) {
            if (err != null) {
              cb(err);
            }
            if (!(mdl != null)) {
              cb('Not Found');
            }
            eChklst.model = mdl.toObject();
            return cb(null);
          });
        }
      ], function(err, results) {
        if (err != null) {
          callback(err, null);
          return;
        }
        return callback(null, eChklst);
      });
    };

    /*
    	Performs deep property population on an array of {AircraftChecklistSchemaInternal} objects.
    	@param arrChkLists [Array<AircraftChecklistSchemaInternal>] The array of objects to deeply populate.
    	@param callback [Function] A function meeting the {Callbacks#managerExpandArrayCallback} requirements.
    */


    ChecklistManager.prototype.expandAll = function(arrChkLists, callback) {
      var eArrChkLists,
        _this = this;
      if (!(arrChkLists != null)) {
        callback('Array cannot be a null reference', null);
      }
      eArrChkLists = [];
      return async.forEach(arrChkLists, function(item, cb) {
        return _this.expand(item, function(err, newItem) {
          if (err != null) {
            cb(err);
            return;
          }
          eArrChkLists.push(newItem);
          return cb(null);
        });
      }, function(err) {
        if (err != null) {
          callback(err, null);
          return;
        }
        return callback(null, eArrChkLists);
      });
    };

    return ChecklistManager;

  })();

  module.exports = ChecklistManager;

}).call(this);
