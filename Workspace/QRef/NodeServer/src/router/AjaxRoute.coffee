Route = require('./Route')
AjaxResponse = require('../serialization/AjaxResponse')
class AjaxRoute extends Route
	constructor: (methods) ->
		super methods
	put: (req, res) ->
		resp = new AjaxResponse(null)
		resp.failure('Method Not Allowed', 405)
		res.json(resp, 200)
	del: (req, res) ->
		resp = new AjaxResponse(null)
		resp.failure('Method Not Allowed', 405)
		res.json(resp, 200)
module.exports = AjaxRoute