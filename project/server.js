/*********************************************************************************
	Dependencies
/********************************************************************************/
var path = require('path')
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
/********************************************************************************/
var env = process.argv.length > 2 ? process.argv[2].toLowerCase() : 'development'
	, port = process.env.PORT || 8081
	, clientPath = (env == "development") ? path.join(__dirname, '/public') : path.join(__dirname, '/dist' )
	
var app = exports.app = express()
	, config = exports.config = require('./config/' + env)
	, db = exports.db = null
	, sessionStore = exports.sessionStore = null
	, httpServer = null
	, io = null

/*********************************************************************************
	Mongo Database
/********************************************************************************/
var connectDatabase = function(next) {
	var ms = new mongoServer(config.database.host, config.database.port, { auto_reconnect: true, safe: true });
	var mc = new mongoClient(ms);
	// open connection to database
	mc.open(function(err, client) {
		if(err) throw err;
		// setup general database variable for manipulation
		db = client.db(config.database.db);
		// create session store
		sessionStore = new mongoStore(config.database);
		console.log('Connected to Mongo Database: ' + config.database.db);
		// next method
		next();
	})
}

/*********************************************************************************
	Express 
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
    Server End Points      
/********************************************************************************/
var configureEndPoints = function() {
	app.get('/', function(req, res) {
		req.session.loginDate = new Date().toString()
		res.sendfile(clientPath + '/index.html')
	})
	// loads all routes in routes folder
	require('./routes/')(app);
	// capture everything else - setup 405 / 500 here
	app.use(function (req, res, next) {
        res.sendfile(clientPath + "/index.html");
    });
}
/*********************************************************************************
                            Socket IO Configuration      
/********************************************************************************/
var setupSocketIO = function () {
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
    // connection handler
    io.sockets.on('connection', function (socket) {
        var hs = socket.handshake;
        if (socket && hs && hs.session) {
            var session = hs.session;
            var user = session.user;
            // let client know its connected successfully
            socket.emit('connected', user)
            console.log('socket connection', user);
            // end points
            socket.on('disconnect', function () {
                console.log('A socket with disconnected!');
            });
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
    console.log("DB Connection Open");
    configureServer();
    console.log("Express Server Configured");
    configureEndPoints();
    console.log("Express End Points Setup");
    httpServer = http.createServer(app).listen(port);
    console.log("Express Server Running on port: " + port);
    setupSocketIO();
    console.log("Socket IO Running"); 
})
    
// session.foo = 'bar'
// session.save() // saves to can access in express routes or other bits of code
// app.io.route = paths
	// req.io.emit(event, data)			= emit to the requesting connected client
	// app.io.broadcast(event, data) 	= emit to all connected clients
	// req.io.broadcast(event, data) 	= emit to all connected clients excluding requester
// rooms
	// req.io.join(room), req.io.leave(room)
	// req.io.room(room).brodcast(event, data)	= emit to all clients 
	// req.io.room(room).broadcast(event, data) = emit to all clients except requester
// socket response (inside a route)
	// req.io.respond(data)
	// client side: io.emit('event', data, callback(data) { alert(data) })
