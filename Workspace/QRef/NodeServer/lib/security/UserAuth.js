(function() {
  var Dictionary, ObjectId, QRefDatabase, UserAuth, async, crypto, mongoose;

  crypto = require('crypto');

  mongoose = require('mongoose');

  QRefDatabase = require('../db/QRefDatabase');

  ObjectId = mongoose.Types.ObjectId;

  Dictionary = require('../collections/Dictionary');

  async = require('async');

  /*
  Secure utility methods for managing users, credentials, and tokens.
  @author Nathan Klick
  @copyright QRef 2012
  */


  UserAuth = (function() {
    /*
    	Creates a new UserAuth object instance.
    */

    function UserAuth() {}

    /*
    	Generates a random salt.
    	@return [String] A hexadecimal string representing a SHA-512 hash.
    */


    UserAuth.prototype.salt = function() {
      var hash;
      hash = crypto.createHash('sha512');
      hash.update(crypto.randomBytes(1024));
      return hash.digest('hex');
    };

    /*
    	Performs an HMAC transformation on a password using a given key and salt values.
    	@param key [String] The key to use with the HMAC algorithm.
    	@param salt [String] A hexadecimal string representing a SHA-512 salt value.
    	@param password [String] The clear text password to be encoded.
    	@return [String] A hexadecimal string representing a secure SHA-512 HMAC representation of the clear text password.
    */


    UserAuth.prototype.securePassword = function(key, salt, password) {
      var hmac, sKey;
      sKey = key + salt;
      hmac = crypto.createHmac('sha512', sKey);
      hmac.update(password);
      return hmac.digest('hex');
    };

    /*
    	Generates a random secure token using the given key and salt values.
    	@param key [String] The key to use with the HMAC algorithm.
    	@param salt [String] A hexadecimal string representing a SHA-512 salt value.
    	@return [String] A hexadecimal string representing a secure random token.
    */


    UserAuth.prototype.secureToken = function(key, salt) {
      var sPassword;
      sPassword = '' + Date.now() + crypto.randomBytes(64);
      return this.securePassword(key, salt, sPassword);
    };

    /*
    	Validates a given userName and password against the database.
    	@param userName [String] The username to validate.
    	@param password [String] The clear text password to validate.
    	@param callback [Function] A function meeting the requirements of the {Callbacks#userAuthValidateCredentialCallback} method.
    */


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

    /*
    	Validate a secure token against the database records.
    	@param token [String] A hexadecimal string representing a secure token.
    	@param callback [Function] A function meeting the requirements of the {Callbacks#userAuthValidateCredentialCallback} method.
    */


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

    /*
    	Validates a set of user credentials against the database and issues a valid token if the credentials are valid.
    	@param userName [String] The username to validate.
    	@param password [String] The clear text password to validate.
    	@param callback [Function] A function meeting the requirements of the {Callbacks#userAuthLoginCallback} method.
    */


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

    /*
    	A helper method user to extract a token from the Authorization HTTP header and pass it to the {#validateToken} method.
    	@param req [Express.Request] The HTTP request object.
    	@param callback [Function] A function meeting the requirements of the {Callbacks#userAuthValidateCredentialCallback} method.
    */


    UserAuth.prototype.validateRequest = function(req, callback) {
      return this.validateToken(req.header('Authorization'), callback);
    };

    /*
    	Validates and extends the life of an existing secure token.
    	@param token [String] A hexadecimal string representing a secure token.
    	@param callback [Function] A function meeting the requirements of the {Callbacks#userAuthValidateCredentialCallback} method.
    */


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

    /*
    	Creates a new user account with no roles.
    	@param userName [String] The userName to create. This should always be the email address of the user.
    	@param password [String] The clear text password provided by the user.
    	@param callback [Function] A function meeting the requirements of the {Callbacks#userAuthCreateAccountCallback} method.
    */


    UserAuth.prototype.createAccount = function(userName, password, callback) {
      var db, userGuid, userHash, userSalt;
      db = QRefDatabase.instance();
      userSalt = this.salt();
      userGuid = new ObjectId();
      userHash = this.securePassword(userGuid, userSalt, password);
      return db.Role.where('roleName').equals('Users').findOne(function(err, role) {
        var user;
        if (err != null) {
          callback(err, false, 4);
          return;
        }
        if (!(role != null)) {
          callback(err, false, 5);
          return;
        }
        user = new db.User();
        user._id = userGuid;
        user.passwordSalt = userSalt;
        user.passwordHash = userHash;
        user.emailAddress = userName;
        user.userName = userName;
        user.roles.push(role._id);
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
      });
    };

    /*
    	Retrieves the associate user account for a secure token.
    	@param token [String] A hexadecimal string representing a secure token.
    	@param callback [Function] A function meeting the requirements of the {Callbacks#userAuthUserFromTokenCallback} method.
    */


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

    /*
    	Determines if the currently authenticated user is in the given role.
    	@param token [String] A hexadecimal string representing a secure token.
    	@param roleName [String] The name of the role. 
    	@param callback [Function] A function meeting the requirements of the {Callbacks#userAuthIsInRoleCallback} method.
    */


    UserAuth.prototype.isInRole = function(token, roleName, callback) {
      var db;
      db = QRefDatabase.instance();
      return db.AuthToken.where('token').equals(token).populate('user').findOne(function(err, tk) {
        if (err != null) {
          callback(err, false);
          return;
        }
        if (!(tk != null)) {
          callback(null, false);
          return;
        }
        return db.Role.where('roleName').equals(roleName).findOne(function(err, role) {
          var bFound;
          if (err != null) {
            callback(err, false);
            return;
          }
          if (!(role != null)) {
            callback(null, false);
            return;
          }
          bFound = false;
          return async.forEach(tk.user.roles, function(item, cb) {
            if (item.toString() === role._id.toString()) {
              bFound = true;
            }
            return cb(null);
          }, function(err) {
            return callback(null, bFound);
          });
        });
      });
    };

    return UserAuth;

  })();

  ({
    /*
    	Determines if the currently authenticated user is in any of the listed roles.
    	@param token [String] A hexadecimal string representing a secure token.
    	@param roles [Array<String>] The array of roles for which to check for membership.
    	@param callback [Function] A function meeting the requirements of the {Callbacks#userAuthIsInRoleCallback} method.
    */

    isInAnyRole: function(token, roles, callback) {
      var db;
      db = QRefDatabase.instance();
      return db.AuthToken.where('token').equals(token).populate('user').findOne(function(err, tk) {
        var arrQueryEntries, r, _i, _len;
        if (err != null) {
          callback(err, false);
          return;
        }
        if (!(tk != null)) {
          callback(null, false);
          return;
        }
        arrQueryEntries = [];
        for (_i = 0, _len = roles.length; _i < _len; _i++) {
          r = roles[_i];
          arrQueryEntries.push({
            roleName: r
          });
        }
        return db.Role.find({
          "$or": arrQueryEntries
        }).exec(function(err, arrRoles) {
          var bFound, dctRoleKeys, _j, _len1;
          if (err != null) {
            callback(err, false);
            return;
          }
          if (arrRoles.length === 0) {
            callback(null, false);
            return;
          }
          bFound = false;
          dctRoleKeys = new Dictionary();
          for (_j = 0, _len1 = arrRoles.length; _j < _len1; _j++) {
            r = arrRoles[_j];
            dctRoleKeys.set(r._id.toString(), r.roleName);
          }
          return async.forEach(tk.user.roles, function(item, cb) {
            if (dctRoleKeys.containsKey(item.toString())) {
              bFound = true;
            }
            return cb(null);
          }, function(err) {
            return callback(err, bFound);
          });
        });
      });
    }
  });

  module.exports = new UserAuth();

}).call(this);
