(function() {
  var QRefDatabase, UserAuth, crypto;

  crypto = require('crypto');

  QRefDatabase = require('../db/QRefDatabase');

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
      db = new QRefDatabase();
      return db.Users.where('userName').equals(userName).findOne(function(err, user) {
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
      db = new QRefDatabase();
      return db.AuthTokens.where('token').equals(token).findOne(function(err, obj) {
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
      db = new QRefDatabase();
      return db.Users.where('userName').equals(userName).findOne(function(err, user) {
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
            tk = new db.AuthTokens();
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
      db = new QRefDatabase();
      return db.AuthTokens.where('token').equals(token).findOne(function(err, obj) {
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

    return UserAuth;

  })();

  module.exports = new UserAuth();

}).call(this);
