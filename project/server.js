/*********************************************************************************
	Dependencies
		- Node Modules and Packages
/********************************************************************************/
var path = require('path')
	, fs = require('fs')
    , http = require('http')
    , request = require('request')
    , express = require('express')
    , connect = require('connect')
    , socketIO = require('socket.io')
    , mongoClient = require('mongodb').MongoClient
	, mongoServer = require('mongodb').Server
	, mongoStore = require('connect-mongo')(express)
    , cookie = require('cookie')
/*********************************************************************************
	General Configuration & Exported Variables  
		- Export means these variable is accessible by other files
		- E.g. io.sockets.emit can be used anywhere
/********************************************************************************/
var env = process.argv.length > 2 ? process.argv[2].toLowerCase() : 'development'
	, port = process.env.PORT || 8081
	, clientPath = (env == "development") ? path.join(__dirname, '/public') : path.join(__dirname, '/dist' )
	, expressRoutesPath = path.join(__dirname, '/routes/api')
	, socketIORoutesPath = path.join(__dirname, '/routes/socket')

var app = exports.app = express()
	, config = exports.config = require('./config/' + env)
	, methods = exports.methods = require('./methods/methods.js')
	, db = exports.db = null
	, sessionStore = exports.sessionStore = null
	, httpServer = null
	, io = exports.io = null
/*********************************************************************************
	Mongo Database
		- connect to the database based on the JSON config file
		- sets up a session store
		- pass a callback so the rest of the "startup" can proceed
/********************************************************************************/
var connectDatabase = function(next) {
	var ms = new mongoServer(config.database.host, config.database.port, { auto_reconnect: true, safe: true });
	var mc = new mongoClient(ms);
	// open connection to database
	mc.open(function(err, client) {
		if(err) throw err;
		// setup general database variable for manipulation
		db = client.db(config.database.db);
		// set the database against the methods
		methods.init(db);
		// create session store
		sessionStore = new mongoStore(config.database);
		// next method
		next();
	})
}
/*********************************************************************************
	Express 
		- with sessions, development and production setup
		- uses mongo store for sessions
		- cross domain can be removed, useful if setting up an API address
/********************************************************************************/
// cross domain access
var allowCrossDomain = function (req, res, next) {
	// could set specific url here
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

// server configuration
var configureServer = function () { 
	// general settings
    app.configure(function () {
        app.set('port', port);
        app.use(express.favicon());
        app.use(express.logger('dev'));
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(allowCrossDomain);
        app.use(express.cookieParser(config.session.secret));
        app.use(express.session({
            secret	: config.session.secret
            , key	: config.session.key
            , store	: sessionStore
            , cookie: { maxAge: new Date(Date.now() + 864000000) } // one day
        }));
        app.use(app.router);
        app.use(express.static(clientPath));
    });
    // development settings
    app.configure('development', function () {
        app.use(express.errorHandler());
    });
    //production settings
    app.configure('production', function () {
        app.use(express.logger());
        app.use(express.errorHandler());
    });
}
/*********************************************************************************
    Express Server End Points    
	- sets up the route path end point and the catch all end point
	- loads individual routes from the routes/express folder  
/********************************************************************************/
var configureExpressEndPoints = function() {
	app.get('/', function(req, res) {
		req.session.loginDate = new Date().toString()
		res.sendfile(clientPath + '/index.html')
	})
	// loads all routes in routes express folder
    fs.readdirSync(expressRoutesPath).forEach(function (file) {
        if (file.substr(file.lastIndexOf('.') + 1) !== 'js')
            return;
        var name = file.substr(0, file.indexOf('.'));
        require(expressRoutesPath + "/" + name)(app);
    });
	// capture everything else - setup 405 / 500 here
	app.use(function (req, res, next) {
        res.sendfile(clientPath + "/index.html");
    });
}
/*********************************************************************************
	Socket IO Configuration      
/********************************************************************************/
var configureSocketIO = function () {
    io = socketIO.listen(httpServer);
    io.configure('production', function () {
        io.enable('browser client minification');
        io.enable('browser client etag');
        io.enable('browser client gzip');
        io.set("polling duration", 10);
        io.set('log level', 1);
        io.set('transports', [
            'websocket',
            'flashsocket',
            'htmlfile',
            'xhr-polling',
            'jsonp-polling'
        ]);
    });
    io.configure('productionLongPolling', function () {
        io.set("transports", ["xhr-polling"]);
        io.set("polling duration", 10);
    });
    // authorization
    io.set('authorization', function (data, accept) {
        if (!data.headers.cookie) {
            return accept('No cookie transmitted.', false);
        };
        data.cookie = cookie.parse(data.headers.cookie);
        data.sessionId = connect.utils.parseSignedCookie(data.cookie['express.sid'], config.session.secret);
		sessionStore.get(data.sessionId, function(err, session) {
			if (err || !session) {
				accept('Error', false);
			} else {
				data.session = session;
				accept(null, true);
			}
		})
    });
}
/*********************************************************************************
    Socket IO Server End Points      
		- sets up initial connection and error sockets
		- loads individual socket routes from the files in the routes/socket folder
		- puts these methods into a json object which are passed to the connecting sockets
/********************************************************************************/
var configureSocketIOEndPoints = function() {
	var socketMethods = {};
	fs.readdirSync(socketIORoutesPath).forEach(function (file) {
        if (file.substr(file.lastIndexOf('.') + 1) !== 'js')
            return;
        var name = file.substr(0, file.indexOf('.'));
        var methods = require(socketIORoutesPath + "/" + name);
		for(key in methods){
			socketMethods[key] = methods[key]
		}
    });
	// initial connection handler
    io.sockets.on('connection', function (socket) {
        var hs = socket.handshake;
        if (socket && hs && hs.session) {
            var session = hs.session;
            var user = session.user;
            // let client know its connected successfully
            socket.emit('connected', user)
			// bind socket methods onto the socket
			for(key in socketMethods){
				socket.on(key, socketMethods[key]);
			}
        }
    });
    // error handler
    io.sockets.on('error', function () { 
		console.log(arguments); 
	});
}
/*********************************************************************************
	Run Server      
/********************************************************************************/
connectDatabase(function() {
   	console.log('Connected to Mongo Database: ' + config.database.db);
    configureServer();
    console.log("Express Server Configured");
    configureExpressEndPoints();
    console.log("Express End Points Setup");
    httpServer = http.createServer(app).listen(port);
    console.log("Express Server Running on Port: " + port);
    configureSocketIO();
    console.log("Socket IO Running"); 
    configureSocketIOEndPoints();
    console.log("Socket IO End Points Setup");
})
/*********************************************************************************
     End
/********************************************************************************/