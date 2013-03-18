
/**
 * Module dependencies.
 */
var cluster = require('cluster');
var numCPUs = require('os').cpus().length * 2;

if (cluster.isMaster) {

  var async = require('async');
  // Fork workers.
  function messageHandler(msg) {
	  if (msg.cmd && msg.cmd == 'clusterTerminate') {
		  console.log("Cluster received termination request.");
		  cluster.disconnect();
		  
		  Object.keys(cluster.workers).forEach(function(id) {
				 cluster.workers[id].destroy();
			  });
		  
		  
	  } else if (msg.cmd && msg.cmd == 'clusterRecycle') {
		console.log("Cluster received recycle request.");
		
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
		Router = require('./lib/router/Router'),
		UserAuth = require('./lib/security/UserAuth'),
		http = require('http'),
		https = require('https'),
		fs = require('fs');
	
	var QRefDatabase = require('./lib/db/QRefDatabase');

	/*
	var secureOptions = {
                key: fs.readFileSync('/storage/ssl/my.qref.com.key'),
                cert: fs.readFileSync('/storage/ssl/my.qref.com.crt'),
				ca: fs.readFileSync('/storage/ssl/gd_bundle.crt')
        };
	*/
	var secureOptions = {
                pfx: fs.readFileSync('/storage/ssl/my.qref.com.pfx'),
                passphrase: 'password'
        };
	

	var httpApp = express.createServer();
	var httpsApp = express.createServer(secureOptions);

	var enforceSecure = function (req, res, next) {
		if (!req.secure) {
			var url  = 'https://' + req.headers.host + req.path;
			var querySet = Object.keys(req.query);
			var queryString = '';
			
			if (querySet.length > 0) {
				for (var i = 0; i < querySet.length; i++) {
					var v = req.query[querySet[i]];
					var k = querySet[i];

					queryString += k + '=' + encodeURIComponent(v) + '&';
				}

				queryString = queryString.substr(0, queryString.length - 1);
				url += '?' + queryString;
			}

			res.redirect(url);
		}
	};
	
	var allowCrossDomain = function(req, res, next) {
	    res.header('Access-Control-Allow-Origin', '*');
	    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	    res.header('Access-Control-Allow-Headers', 'Content-Type');

	    next();
	};	
	// Configuration
	
	httpApp.configure(function(){
	  httpApp.use(enforceSecure);
	  httpApp.use(express.bodyParser({ keepExtensions: true }));
	  httpApp.use(express.methodOverride());
	  httpApp.use(express.compress());
	  httpApp.use(express.static('../WebContent'));
	  httpApp.use(allowCrossDomain);
	  httpApp.use(express.cookieParser());
	});
	
	httpApp.configure('development', function(){
	  httpApp.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	});
	
	httpApp.configure('production', function(){
	  httpApp.use(express.errorHandler());
	});

	httpsApp.configure(function(){
	  httpsApp.use(express.bodyParser({ keepExtensions: true }));
	  httpsApp.use(express.methodOverride());
	  httpsApp.use(express.compress());
	  httpsApp.use(express.static('../WebContent'));
	  httpsApp.use(allowCrossDomain);
	  httpsApp.use(express.cookieParser());
	});

	httpsApp.configure('development', function(){
	  httpsApp.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	});

	httpsApp.configure('production', function(){
	  httpsApp.use(express.errorHandler());
	});

	
	var rtr = new Router(httpsApp);
	//var httpsRtr = new Router(httpsApp);


	rtr.load();
	rtr.setup();

	//httpsRtr.load();
	//httpsRtr.setup();	
	
	httpApp.get('/api/node/recycle', function(req, res) {
	
		if (req.query != null && req.query.token != null) {
			UserAuth.isInRole(req.query.token, 'Administrators', function(err, hasRole) {
				if (err != null || !hasRole) {
					res.json({ status: 'Not Authorized' }, 200);
				}
				
				console.log("Express server recycling from api call.");
		
				var response = { status: 'ok' };
				res.json(response, 200);
				setTimeout(function() { process.send({ cmd: 'clusterRecycle' }); }, 1250);
			});
		} else {
			res.json({ status: 'Not Authorized' }, 200);
			return;
		}
		
		
	});
	
	 httpsApp.get('/api/node/recycle', function(req, res) {

                if (req.query != null && req.query.token != null) {
                        UserAuth.isInRole(req.query.token, 'Administrators', function(err, hasRole) {
                                if (err != null || !hasRole) {
                                        res.json({ status: 'Not Authorized' }, 200);
                                }

                                console.log("Express server recycling from api call.");

                                var response = { status: 'ok' };
                                res.json(response, 200);
                                setTimeout(function() { process.send({ cmd: 'clusterRecycle' }); }, 1250);
                        });
                } else {
                        res.json({ status: 'Not Authorized' }, 200);
                        return;
                }


        });

	
	
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
	
	httpApp.listen(80, '10.1.224.64', function(){
	  console.log("Express server listening on port %d in %s mode", httpApp.address().port, httpApp.settings.env);
	});

	httpsApp.listen(443, '10.1.224.64', function (){
	 console.log("Express server listening on port %d in %s mode", httpsApp.address().port, httpsApp.settings.env);
	});
}
