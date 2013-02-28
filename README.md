Synopsis

A mongodb, node, session, backbone, socket.io, passport authentication, twitter bootstrap single page application starting point (with loads of comments).
The node server has everything setup so all thats needed to be done is a npm install, adjust the config/development.json file, and run node server.js
By everything I mean the following...


Server Side (folders include config, methods, routes, and server.js)

	1) Connection to the database specified in the config file
	2) Setting up an express server and seperating development and production settings up
	3) Seperation of express end points into a clean folder / file structure
		3a) Adding a new routes to the routes/api/api.js file
		3b) Add a new JS file to this folder with a similar structure, automatically added to the available end points
	4) Added passport authentication with callbacks for Google and Twitter, Facebook handled client side using the JS SDK.
		4a) Client side handles Google and Twitter via a popup window trick so no page reload needed!
	5) Setup socket.io to share sessions with express. Handles connectivity and sessions nicely.
	6) Seperation of socket.io "on" end points into a clean folder / file structure as above (3) - routes/socket/general.js

Client Side (everything in the public folder)

	1) Require.js is used for logical loading of javascript files. (config.js, main.js)
	2) 


Motivation

To come........

Installation

To come........

API Reference

To come........

Contributors 

Shaun Nesbitt <uksn@me.com>

License

Open Source - do with it as you will, feedback is always appreciated.