mongoose = require('mongoose')
QRefSlave = require('./QRefSlave')
###
Database middleware class that handles connection setup and exposes available data models.
Creating multiple instances of this class will create a new connection for each instance; therefore, 
the application only spins up one copy of this class at startup and exposes a global variable named QRefDatabase 
which is reused through the application. The convience method {#instance} is used to grab a reference off of 
this global QRefDatabase variable. Only one connection to the MongoDB server is ever needed for the life of the 
application because all requests to mongo occur in an evented manner and a single connection object can handle 
multiple requests at a time. 

@example Getting a reference from QRefDatabase global variable
  db = QRefDatabase.instance()

@author Nathan Klick
@copyright QRef 2012
###
class QRefSlaveManager
	slaves: []
	constructor: () ->
		@.initialize()
	###
	Attaches all the schemas to mongoose and sets up the model references.
	###
	initialize: () ->
		@.createSlave('master', 'mongodb://qref:qref@10.1.113.180:27017,10.1.113.181:27017/qref?replicaSet=inds-rs0')
		@.createSlave('slave', 'mongodb://qref:qref@10.1.113.180:27017,10.1.113.181:27017/qref-sportys?replicaSet=inds-rs0')
	createSlave: (slaveName, mongoUrl) =>
		if @.hasSlave(slaveName)
			return false
		
		slave = new QRefSlave(slaveName, mongoUrl)
		@slaves.push(slave)
		return true
	getSlaves: () => @slaves
	getSlave: (slaveName) =>
		for s in @slaves
			if s.getName() == slaveName
				return s
		
		return null
	hasSlave: (slaveName) =>
		for s in @slaves
			if s.getName() == slaveName
				return true
		
		return false
	
	###
	Safety method for retrieving a reference to the current instance of this object.
	@return [QRefDatabase] A reference to the current instance of this object.
	###
	instance: () -> @
module.exports = new QRefSlaveManager()
		