(function() {
  var NodeExitRoute, Route,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Route = require('../../Route');

  /*
  **** DEVELOPER ONLY **** 
  Route used to terminate current node worker pool.
  @example Service Methods
    Request Format: application/json
    Response Format: application/json
    
    GET /services/rpc/node/exit
     
    Causes the node process to terminate.
  @todo Remove prior to product publish.
  @author Nathan Klick
  @copyright QRef 2012
  */


  NodeExitRoute = (function(_super) {

    __extends(NodeExitRoute, _super);

    function NodeExitRoute() {
      NodeExitRoute.__super__.constructor.call(this, [
        {
          method: 'GET',
          path: '/node/exit'
        }
      ]);
    }

    NodeExitRoute.prototype.get = function(req, res) {
      var response;
      console.log("Express server exiting from api call.");
      response = {
        status: 'ok'
      };
      res.json(response, 200);
      return process.send({
        cmd: 'clusterTerminate'
      });
    };

    return NodeExitRoute;

  })(Route);

  module.exports = new NodeExitRoute();

}).call(this);
