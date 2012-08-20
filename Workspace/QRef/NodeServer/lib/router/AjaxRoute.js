(function() {
  var AjaxResponse, AjaxRoute, Route,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Route = require('./Route');

  AjaxResponse = require('../serialization/AjaxResponse');

  AjaxRoute = (function(_super) {

    __extends(AjaxRoute, _super);

    function AjaxRoute(methods) {
      AjaxRoute.__super__.constructor.call(this, methods);
    }

    AjaxRoute.prototype.put = function(req, res) {
      var resp;
      resp = new AjaxResponse(null);
      resp.failure('Method Not Allowed', 405);
      return res.json(resp, 200);
    };

    AjaxRoute.prototype.del = function(req, res) {
      var resp;
      resp = new AjaxResponse(null);
      resp.failure('Method Not Allowed', 405);
      return res.json(resp, 200);
    };

    return AjaxRoute;

  })(Route);

  module.exports = AjaxRoute;

}).call(this);
