(function() {
  var NodeStatsRoute, Route, UserSchema, mongoose, os,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Route = require('../../Route');

  mongoose = require('mongoose');

  UserSchema = require('../../../schema/UserSchema');

  os = require('os');

  /*
  **** DEVELOPER ONLY **** 
  Route used to acquire detailed runtime info about the node server during development.
  @example Service Methods
    Request Format: application/json
    Response Format: application/json
    
    GET /services/restful/node/stats
     
    Retrieves node runtime statistics.
  @todo Remove prior to product publish.
  @author Nathan Klick
  @copyright QRef 2012
  */


  NodeStatsRoute = (function(_super) {

    __extends(NodeStatsRoute, _super);

    function NodeStatsRoute() {
      NodeStatsRoute.__super__.constructor.call(this, [
        {
          method: 'GET',
          path: '/node/stats'
        }
      ]);
    }

    NodeStatsRoute.prototype.get = function(req, res) {
      var response;
      console.log("Express server rendering runtime report.");
      response = {
        tempDir: os.tmpDir(),
        hostName: os.hostname(),
        osType: os.type(),
        osArch: os.arch(),
        osRelease: os.release(),
        osUptime: os.uptime(),
        osLoadAvg: os.loadavg(),
        totalMem: os.totalmem(),
        freeMem: os.freemem(),
        cpus: os.cpus(),
        processMem: process.memoryUsage(),
        processUptime: process.uptime(),
        networkInterfaces: os.networkInterfaces()
      };
      return res.json(response, 200);
    };

    return NodeStatsRoute;

  })(Route);

  module.exports = new NodeStatsRoute();

}).call(this);
