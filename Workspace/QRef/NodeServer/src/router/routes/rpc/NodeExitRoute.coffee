Route = require('../../Route')
class NodeExitRoute extends Route
	constructor: () ->
		super [{ method: 'GET', path: '/node/exit'}]
	get: (req, res) ->
		console.log("Express server exiting from api call.");
		
		response = 
			status: 'ok'
		
		res.json(response, 200);
		process.send({ cmd: 'clusterTerminate' })
module.exports = new NodeExitRoute()