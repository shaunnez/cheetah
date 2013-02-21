/*********************************************************************************
	Dependencies
/********************************************************************************/
var request = require('request')
// load the methods from the parent file
var methods = module.parent.exports.methods;
// reference io from parent so we can broadcast
var io = module.parent.exports.io;
/*********************************************************************************
                                ROUTES     
/********************************************************************************/
module.exports = function (app) {
    // authenticate - make sure session is valid
    var authenticateRequest = function (req, res, next) {
        next();
        /*
        var userId = req.session.userId;
        authenticateSession(userId, function (result) {
            if (result == true) {
                next();
            } else {
                res.send(401);
            }
        });*/
    }


    // delete existing item
    app.delete("/api/:collectionName/:id", authenticateRequest, function (req, res) {
        var collectionName = req.params.collectionName;
        var id = req.params.id;
        methods.deleteCollectionItem(collectionName, id, function (result) {
            res.send(result);
        });
    })

    // login username and password
    app.post("/api/login", authenticateRequest, function (req, res) {
        var email = req.body.email || req.body.username;
        var password = req.body.password;
        // authenticate user
        methods.authenticateUser(email, password, function (result) {
            req.session.user = result.data;
            // send result
            res.send(result);
        });
    });

    // register username and password
    app.post("/api/register", authenticateRequest, function (req, res) {
        var email = req.body.email;
        methods.registerUser(email, function (result) {
            req.session.user = result.data;
            res.send(result);
        });
    });

    // logout
    app.get("/api/logout", authenticateRequest, function (req, res) {
        methods.logRequest(req.session.user_id, "logout", "get", "");
        req.session.destroy();
        res.redirect("/");
    });

    // demo remote query using request
    app.post("/api/remoteJSONQuery", authenticateRequest, function (req, res) {
        // url https://api.twitter.com/1.1/users/search.json?q=Twitter%20API&page=1&per_page=5
        // method = "GET"
        var options = { url: req.body.url, method: req.body.method }
        if (req.body.json) {
            options.json = req.body.json;
        }
        request(options, function (error, response, body) {
            var output = { result: false, data: null };
            // body is the returned object from the app
            if (!error && response.statusCode == 200) {
                output.result = true;
                output.data = response.body;
            }
            res.send(output);
        })
    })

    // list of collection, if query string do advanced pagination
    app.get("/api/:collectionName", authenticateRequest, function (req, res) {
        var collectionName = req.params.collectionName;
        var options = req.query;
        if (options.query || options.limit || options.skip || options.sort) {
            methods.getCollectionListAdvanced(collectionName, options, function (result) {
                res.send(result);
            });
        } else {
            getCollectionList(collectionName, function (result) {
                res.send(result);
            });
        }
    });

    // single item from collection
    app.get("/api/:collectionName/:id", authenticateRequest, function (req, res) {
        var collectionName = req.params.collectionName;
        var id = req.params.id;
        var name = req.params.name;
        methods.getCollectionItemById(collectionName, id, function (result) {
            res.send(result.data);
        });
    });

    // create new item
    app.post("/api/:collectionName", authenticateRequest, function (req, res) {
        var collectionName = req.params.collectionName;
        var options = req.body;
        methods.addCollectionItem(collectionName, options, function (result) {
            if (collectionName == "User") {
                req.session.user = result.data;
            }
            res.send(result.data);
        });
    });

    // edit existing item
    app.put("/api/:collectionName/:id", authenticateRequest, function (req, res) {
        var collectionName = req.params.collectionName;
        var id = req.params.id;
        var options = req.body;
        methods.editCollectionItem(collectionName, id, options, function (result) {
            res.send(result.data);
        });
    })
}
/*********************************************************************************
     End
/********************************************************************************/