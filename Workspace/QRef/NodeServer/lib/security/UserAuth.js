(function() {
  var ObjectId, QRefDatabase, UserAuth, crypto, mongoose;

  crypto = require('crypto');

  mongoose = require('mongoose');

  QRefDatabase = require('../db/QRefDatabase');

  ObjectId = mongoose.Types.ObjectId;

  UserAuth = (function() {

    function UserAuth() {}

    UserAuth.prototype.salt = function() {
      var hash;
      hash = crypto.createHash('sha512');
      hash.update(crypto.randomBytes(1024));
      return hash.digest('hex');
    };

    UserAuth.prototype.securePassword = function(key, salt, password) {
      var hmac, sKey;
      sKey = key + salt;
      hmac = crypto.createHmac('sha512', sKey);
      hmac.update(password);
      return hmac.digest('hex');
    };

    UserAuth.prototype.secureToken = function(key, salt) {
      var sPassword;
      sPassword = '' + Date.now() + crypto.randomBytes(64);
      return this.securePassword(key, salt, sPassword);
    };

    UserAuth.prototype.validateCredential = function(userName, password, callback) {
      var db,
        _this = this;
      db = QRefDatabase.instance();
      return db.User.where('userName').equals(userName).findOne(function(err, user) {
        var pwHash;
        if (err != null) {
          callback(err, false);
        }
        if (user != null) {
          pwHash = _this.securePassword(user._id, user.passwordSalt, password);
          return callback(null, pwHash === user.passwordHash);
        } else {
          return callback(null, false);
        }
      });
    };

    UserAuth.prototype.validateToken = function(token, callback) {
      var db,
        _this = this;
      db = QRefDatabase.instance();
      return db.AuthToken.where('token').equals(token).findOne(function(err, obj) {
        if (err != null) {
          callback(err, false);
          return;
        }
        if (obj != null) {
          return callback(null, Date.now() < obj.expiresOn);
        } else {
          return callback(null, false);
        }
      });
    };

    UserAuth.prototype.login = function(userName, password, callback) {
      var db,
        _this = this;
      db = QRefDatabase.instance();
      return db.User.where('userName').equals(userName).findOne(function(err, user) {
        var expiry, pwHash, tk;
        if (err != null) {
          callback(err, null, false);
          return;
        }
        if (user != null) {
          pwHash = _this.securePassword(user._id, user.passwordSalt, password);
          if (pwHash === user.passwordHash) {
            expiry = new Date();
            expiry.setHours(expiry.getHours() + 336);
            tk = new db.AuthToken();
            tk.token = _this.secureToken(user._id, user.passwordSalt);
            tk.expiresOn = expiry;
            tk.user = user;
            return tk.save(function(error) {
              if (error != null) {
                return callback(error, null, false);
              } else {
                return callback(null, tk.token, true);
              }
            });
          } else {
            return callback(null, null, false);
          }
        } else {
          return callback(null, null, false);
        }
      });
    };

    UserAuth.prototype.validateRequest = function(req, callback) {
      return this.validateToken(req.header('Authorization'), callback);
    };

    UserAuth.prototype.refreshToken = function(token, callback) {
      var db;
      db = QRefDatabase.instance();
      return db.AuthToken.where('token').equals(token).findOne(function(err, obj) {
        var expiry;
        if (err != null) {
          callback(err, false);
          return;
        }
        if (obj != null) {
          if (Date.now() < obj.expiresOn) {
            expiry = new Date();
            expiry.setHours(expiry.getHours() + 336);
            obj.expiresOn = expiry;
            return obj.save(function(error) {
              if (error != null) {
                return callback(error, false);
              } else {
                return callback(null, true);
              }
            });
          } else {
            return callback(null, false);
          }
        } else {
          return callback(null, false);
        }
      });
    };

    UserAuth.prototype.createAccount = function(userName, password, callback) {
      var db, user, userGuid, userHash, userSalt;
      db = QRefDatabase.instance();
      userSalt = this.salt();
      userGuid = new ObjectId();
      userHash = this.securePassword(userGuid, userSalt, password);
      user = new db.User();
      user._id = userGuid;
      user.passwordSalt = userSalt;
      user.passwordHash = userHash;
      user.emailAddress = userName;
      user.userName = userName;
      return db.User.where('userName').equals(userName).find(function(err, arrObjs) {
        if (err != null) {
          callback(err, false, 1);
          return;
        }
        if ((arrObjs != null) && arrObjs.length > 0) {
          callback(null, false, 2);
        } else {
          return user.save(function(err) {
            if (err != null) {
              return callback(err, false, 3);
            } else {
              return callback(null, true, 0);
            }
          });
        }
      });
    };

    UserAuth.prototype.userFromToken = function(token, callback) {
      var db;
      db = QRefDatabase.instance();
      return db.AuthToken.where('token').equals(token).populate('user').findOne(function(err, tk) {
        if (err != null) {
          callback(err, null);
          return;
        }
        if (!(tk != null)) {
          callback(true, null);
          return;
        }
        return callback(null, tk.user);
      });
    };

    return UserAuth;

  })();

  module.exports = new UserAuth();

}).call(this);
