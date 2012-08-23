
/**
 * Module dependencies.
 */
var cluster = require('cluster');
var numCPUs = require('os').cpus().length * 2;

if (cluster.isMaster) {
  // Fork workers.
  function messageHandler(msg) {
	  if (msg.cmd && msg.cmd == 'clusterTerminate') {
		  console.log("Cluster received termination request.");
		  cluster.disconnect();
		  
		  Object.keys(cluster.workers).forEach(function(id) {
				 cluster.workers[id].destroy();
			  });
		  
		  
	  }
  }
  
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  Object.keys(cluster.workers).forEach(function(id) {
	 cluster.workers[id].on('message', messageHandler);
  });
  

  cluster.on('exit', function(worker, code, signal) {
	var exitCode = worker.process.exitCode;
    console.log('worker ' + worker.pid + ' died (' + exitCode + ')');
    
    
    if (exitCode && exitCode != 0) {
    	
    	cluster.fork();
    	
    	Object.keys(cluster.workers).forEach(function(id) {
    		 cluster.workers[id].on('message', messageHandler);
    	  });
    	
    }
    
  });
} else {

	var express = require('express'),
		Router = require('./lib/router/Router');
	
	var app = module.exports = express.createServer();
	
	var allowCrossDomain = function(req, res, next) {
	    res.header('Access-Control-Allow-Origin', '*');
	    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	    res.header('Access-Control-Allow-Headers', 'Content-Type');

	    next();
	};
	// Configuration
	
	app.configure(function(){
	  app.use(express.bodyParser());
	  app.use(express.methodOverride());
	  app.use(express.static('../WebContent'));
	  app.use(allowCrossDomain);
	  app.use(express.cookieParser());
	});
	
	app.configure('development', function(){
	  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	});
	
	app.configure('production', function(){
	  app.use(express.errorHandler());
	});
	
	var rtr = new Router(app);
	

	rtr.load();
	rtr.setup();
	
	/*
	app.get('/api/node/exit', function(req, res) {
		console.log("Express server exiting from api call.");
		
		var response = { status: 'ok' };
		
		res.json(response, 200);
		process.send({ cmd: 'clusterTerminate' });
		
	});
	*/
	
	
	/*
	app.get('/api/node/stats', function(req, res) {
		console.log("Express server rendering runtime report.");
		
		var response = {
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
		
		res.json(response, 200);
		
	});
	*/
	
	app.listen(80, '10.1.224.61', function(){
	  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
	});
}