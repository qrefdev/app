Route = require('../../Route')
###
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
###
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