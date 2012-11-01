(function() {
  var AuthorizeAppleAircraftProductRoute, QRefDatabase, RpcResponse, RpcRoute, UserAuth, async, https,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  RpcRoute = require('../../../RpcRoute');

  QRefDatabase = require('../../../../db/QRefDatabase');

  RpcResponse = require('../../../../serialization/RpcResponse');

  UserAuth = require('../../../../security/UserAuth');

  https = require('https');

  async = require('async');

  /*
  Service route that performs authentication of Apple IAP Requests.
  @example Service Methods (see {AuthorizeAppleProductRequest})
    Request Format: application/json
    Response Format: application/json
    
    POST /services/rpc/aircraft/product/authorize/apple
      @BODY - (Required) AuthorizeAppleProductRpcRequest
      
    Performs apple IAP authorization and returns the handle to the user specific checklist if successful.
  @author Nathan Klick
  @copyright QRef 2012
  */


  AuthorizeAppleAircraftProductRoute = (function(_super) {

    __extends(AuthorizeAppleAircraftProductRoute, _super);

    function AuthorizeAppleAircraftProductRoute() {
      this.post = __bind(this.post, this);
      AuthorizeAppleAircraftProductRoute.__super__.constructor.call(this, [
        {
          method: 'POST',
          path: '/product/authorize/apple'
        }, {
          method: 'GET',
          path: '/product/authorize/apple'
        }
      ]);
    }

    AuthorizeAppleAircraftProductRoute.prototype.post = function(req, res) {
      var db, productId, receiptData, resp, tailNumber, token, _ref,
        _this = this;
      if (!this.isValidRequest(req)) {
        resp = new RpcResponse(null);
        resp.failure('Bad Request', 400);
        res.json(resp, 200);
        return;
      }
      console.log('INFO: AppleRoute.post() - New request received. Going to validate the token.');
      token = req.param('token');
      productId = req.body.product;
      db = QRefDatabase.instance();
      receiptData = req.body.receipt;
      tailNumber = null;
      if (((_ref = req.body) != null ? _ref.tailNumber : void 0) != null) {
        tailNumber = req.body.tailNumber;
      }
      console.log('INFO: AppleRoute.post() - Body Parsed. { productId: "' + productId + '", token: "' + token + '", receiptData: "' + receiptData + '" }');
      return UserAuth.validateToken(token, function(err, isTokenValid) {
        if ((err != null) || !isTokenValid === true) {
          console.log('INFO: AppleRoute.post() - Invalid token. Rejecting the request.');
          resp = new RpcResponse(null);
          resp.failure('Not Authorized', 403);
          res.json(resp, 200);
          return;
        }
        console.log('INFO: AppleRoute.post() - Token is valid. Going to get the user from the token.');
        return UserAuth.userFromToken(token, function(err, user) {
          if ((err != null) || !(user != null)) {
            console.log('INFO: AppleRoute.post() - Could not get the User from the token. Rejecting the request.');
            resp = new RpcResponse(null);
            resp.failure('Not Authorized', 403);
            res.json(resp, 200);
            return;
          }
          console.log('INFO: AppleRoute.post() - Got a valid user. Going to get the product.');
          return db.Product.findOne({
            _id: productId
          }).populate('aircraftChecklist').exec(function(err, product) {
            var attempt;
            if (err != null) {
              console.log('INFO: AppleRoute.post() - Product lookup failed with an error. Rejecting the request.');
              console.log('INFO: AppleRoute.post() - ' + err.toString());
              resp = new RpcResponse(null);
              resp.failure('Internal Error', 500);
              res.json(resp, 200);
              return;
            }
            if (!(product != null)) {
              console.log('INFO: AppleRoute.post() - Product not found. Rejecting the request.');
              resp = new RpcResponse(null);
              resp.failure('Product Not Found', 404);
              res.json(resp, 200);
              return;
            }
            console.log('INFO: AppleRoute.post() - { product._id: ' + product._id.toString() + ' }');
            attempt = new db.AircraftProductAuthorizationAttempt();
            attempt.user = user._id;
            attempt.product = product._id;
            attempt.attemptType = 'apple';
            attempt.appleReceiptHash = receiptData;
            return attempt.save(function(err) {
              if (err != null) {
                console.log('INFO: AppleRoute.post() - Attempt save failed due to error. Rejecting the request.');
                console.log('INFO: AppleRoute.post() - ' + err.toString());
                resp = new RpcResponse(null);
                resp.failure('Internal Error', 500);
                res.json(resp, 200);
                return;
              }
              console.log('INFO: AppleRoute.post() - Attempt saved initially. Going to validate the receipt with apple.');
              return _this.validateReceipt(token, receiptData, function(err, receipt) {
                if (err != null) {
                  console.log('INFO: AppleRoute.post() - Receipt validation failed due to error. Rejecting the request.');
                  console.log('INFO: AppleRoute.post() - ' + err.toString());
                  resp = new RpcResponse(null);
                  resp.failure('Internal Error', 500);
                  res.json(resp, 200);
                  return;
                }
                if (!(receipt != null)) {
                  console.log('INFO: AppleRoute.post() - Failed to validate the receipt with apple. Rejecting the request.');
                  resp = new RpcResponse(null);
                  resp.failure('Internal Error', 500);
                  res.json(resp, 200);
                  return;
                }
                console.log('INFO: AppleRoute.post() - Receipt validation response received. { status: ' + receipt.status + ' }');
                attempt.appleReceipt = receipt;
                if (receipt.status === 0 && receipt.receipt.product_id === product.appleProductIdentifier) {
                  attempt.isReceiptValid = true;
                  console.log('INFO: AppleRoute.post() - Receipt is valid per apple\'s response. Going to update the attempt.');
                  return attempt.save(function(err) {
                    var uProduct;
                    if (err != null) {
                      console.log('INFO: AppleRoute.post() - Failed to update the attempt due to errors. Rejecting the request.');
                      console.log('INFO: AppleRoute.post() - ' + err.toString());
                      resp.failure('Internal Error', 500);
                      res.json(resp, 200);
                      return;
                    }
                    console.log('INFO: AppleRoute.post() - Attempt updated successfully. Going to install the UserProduct record.');
                    uProduct = new db.UserProduct();
                    uProduct.user = user._id;
                    uProduct.product = product._id;
                    return uProduct.save(function(err) {
                      if ((err != null) && !err.code === 11000) {
                        console.log('INFO: AppleRoute.post() - Failed to install the UserProduct record due to errors. Rejecting the request.');
                        console.log('INFO: AppleRoute.post() - ' + err.toString());
                        console.log('INFO: AppleRoute.post() - ' + JSON.stringify(err));
                        resp = new RpcResponse(null);
                        resp.failure('Internal Error', 500);
                        res.json(resp, 200);
                        return;
                      }
                      console.log('INFO: AppleRoute.post() - UserProduct record installed. Going to clone the checklist.');
                      return _this.cloneChecklist(product.aircraftChecklist, user, tailNumber, function(err, checklistId) {
                        if (err != null) {
                          console.log('INFO: AppleRoute.post() - Failed to clone the checklist due to errors. Rejecting the request.');
                          console.log('INFO: AppleRoute.post() - ' + err.toString());
                          resp = new RpcResponse(null);
                          resp.failure('Internal Error', 500);
                          res.json(resp, 200);
                          return;
                        }
                        console.log('INFO: AppleRoute.post() - Checklist was cloned. Going to update the attempt.');
                        attempt.isComplete = true;
                        attempt.checklist = checklistId;
                        return attempt.save(function(err) {
                          if (err != null) {
                            console.log('INFO: AppleRoute.post() - Failed to update the attempt due to errors. Rejecting the request.');
                            console.log('INFO: AppleRoute.post() - ' + err.toString());
                            resp = new RpcResponse(null);
                            resp.failure('Internal Error', 500);
                            res.json(resp, 200);
                            return;
                          }
                          console.log('INFO: AppleRoute.post() - Attempt updated successfully. Request is complete. Returning success.');
                          resp = new RpcResponse(checklistId);
                          res.json(resp, 200);
                        });
                      });
                    });
                  });
                } else {
                  console.log('INFO: AppleRoute.post() - Receipt is invalid per apple\'s response. Going to update the attempt.');
                  attempt.isReceiptValid = false;
                  return attempt.save(function(err) {
                    if (err != null) {
                      console.log('INFO: AppleRoute.post() - Failed to update the attempt record. Rejecting the request.');
                      console.log('INFO: AppleRoute.post() - ' + err.toString());
                      resp = new RpcResponse(null);
                      resp.failure('Internal Error', 500);
                      res.json(resp, 200);
                      return;
                    }
                    console.log('INFO: AppleRoute.post() - Attempt updated successfully. Rejecting the request per apple\'s response.');
                    resp = new RpcResponse(null);
                    resp.failure('Invalid Receipt', 403);
                    res.json(resp, 200);
                  });
                }
              });
            });
          });
        });
      });
    };

    AuthorizeAppleAircraftProductRoute.prototype.cloneChecklist = function(oChecklist, user, tailNumber, callback) {
      var db, nChecklist;
      db = QRefDatabase.instance();
      nChecklist = new db.AircraftChecklist();
      if (!(oChecklist != null)) {
        callback(new Error('Product does not have an associated checklist.'), null);
        return;
      }
      nChecklist.model = oChecklist.model;
      nChecklist.manufacturer = oChecklist.manufacturer;
      nChecklist.index = null;
      if (tailNumber != null) {
        nChecklist.tailNumber = tailNumber;
      } else {
        nChecklist.tailNumber = null;
      }
      nChecklist.user = user._id;
      nChecklist.version = 1;
      nChecklist.productIcon = oChecklist.productIcon;
      nChecklist.preflight = oChecklist.preflight;
      nChecklist.takeoff = oChecklist.takeoff;
      nChecklist.landing = oChecklist.landing;
      nChecklist.emergencies = oChecklist.emergencies;
      nChecklist.isDeleted = false;
      return nChecklist.save(function(err) {
        if (err != null) {
          callback(err, null);
          return;
        }
        return callback(null, nChecklist._id);
      });
    };

    AuthorizeAppleAircraftProductRoute.prototype.validateReceipt = function(token, receiptData, callback) {
      var options;
      options = {
        hostname: "buy.itunes.apple.com",
        port: 443,
        path: "/verifyReceipt",
        method: "POST"
      };
      return async.waterfall([
        function(cb) {
          return UserAuth.isInRole(token, 'Administrators', function(err, isMember) {
            if (err != null) {
              cb(err, false);
              return;
            }
            if (isMember) {
              options = {
                hostname: "sandbox.itunes.apple.com",
                port: 443,
                path: "/verifyReceipt",
                method: "POST"
              };
              return cb(null, false);
            } else {
              return cb(null, true);
            }
          });
        }, function(shouldExecute, cb) {
          if (!shouldExecute) {
            cb(null);
            return;
          }
          options = {
            hostname: "buy.itunes.apple.com",
            port: 443,
            path: "/verifyReceipt",
            method: "POST"
          };
          return cb(null);
        }
      ], function(err) {
        var data, req, request, requestData;
        if (err != null) {
          callback(err, null);
          return;
        }
        request = {
          "receipt-data": receiptData
        };
        requestData = JSON.stringify(request);
        data = "";
        req = https.request(options, function(res) {
          res.setEncoding('ascii');
          res.on('data', function(buff) {
            return data += buff;
          });
          return res.on('end', function() {
            var response;
            if (data != null) {
              response = JSON.parse(data);
              if (!(response != null)) {
                return callback(new Error('Invalid JSON data received from server.'), null);
              } else {
                return callback(null, response);
              }
            } else {
              return callback(new Error('No data received from the server.'), null);
            }
          });
        });
        req.on('error', function(err) {
          return callback(err, null);
        });
        req.write(requestData);
        return req.end();
      });
    };

    AuthorizeAppleAircraftProductRoute.prototype.isValidRequest = function(req) {
      var _ref, _ref1, _ref2;
      if ((req.body != null) && (((_ref = req.body) != null ? _ref.mode : void 0) != null) && req.body.mode === 'rpc' && (((_ref1 = req.body) != null ? _ref1.product : void 0) != null) && (((_ref2 = req.body) != null ? _ref2.receipt : void 0) != null)) {
        return true;
      } else {
        return false;
      }
    };

    return AuthorizeAppleAircraftProductRoute;

  })(RpcRoute);

  module.exports = new AuthorizeAppleAircraftProductRoute();

}).call(this);
