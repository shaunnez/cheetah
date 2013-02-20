var request = require('request'),
    io = require('socket.io'),
    mongo = require('mongodb'),
	BSON = require('mongodb').BSONPure,
    crypto = require('crypto');

var mongoDb = module.parent.parent.exports.mongoDb;
/*********************************************************************************
                                ROUTES     
/********************************************************************************/
module.exports = function (server) {
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
    server.delete("/api/:collectionName/:id", authenticateRequest, function (req, res) {
        var collectionName = req.params.collectionName;
        var id = req.params.id;
        deleteCollectionItem(collectionName, id, function (result) {
            res.send(result);
        });
    })

    // login username and password
    server.post("/api/login", authenticateRequest, function (req, res) {
        var email = req.body.email || req.body.username;
        var password = req.body.password;
        // authenticate user
        authenticateUser(email, password, function (result) {
            req.session.user = result.data;
            // send result
            res.send(result);
        });
    });

    // register username and password
    server.post("/api/register", authenticateRequest, function (req, res) {
        var email = req.body.email;
        registerUser(email, function (result) {
            req.session.user = result.data;
            res.send(result);
        });
    });

    // logout
    server.get("/api/logout", authenticateRequest, function (req, res) {
        logRequest(req.session.user_id, "logout", "get", "");
        req.session.destroy();
        res.redirect("/");
    });

    // demo remote query using request
    server.post("/api/remoteJSONQuery", authenticateRequest, function (req, res) {
        // url https://api.twitter.com/1.1/users/search.json?q=Twitter%20API&page=1&per_page=5
        // method = "GET"
        var options = { url: req.body.url, method: req.body.method }
        if (req.body.json) {
            options.json = req.body.json;
        }
        request(options, function (error, response, body) {
            var output = { result: false, data: null };
            // body is the returned object from the server
            if (!error && response.statusCode == 200) {
                output.result = true;
                output.data = response.body;
            }
            res.send(output);
        })
    })

    // list of collection, if query string do advanced pagination
    server.get("/api/:collectionName", authenticateRequest, function (req, res) {
        var collectionName = req.params.collectionName;
        var options = req.query;
        if (options.query || options.limit || options.skip || options.sort) {
            getCollectionListAdvanced(collectionName, options, function (result) {
                res.send(result);
            });
        } else {
            getCollectionList(collectionName, function (result) {
                res.send(result);
            });
        }
    });

    // single item from collection
    server.get("/api/:collectionName/:id", authenticateRequest, function (req, res) {
        var collectionName = req.params.collectionName;
        var id = req.params.id;
        var name = req.params.name;
        getCollectionItemById(collectionName, id, function (result) {
            res.send(result.data);
        });
    });

    // create new item
    server.post("/api/:collectionName", authenticateRequest, function (req, res) {
        var collectionName = req.params.collectionName;
        var options = req.body;
        addCollectionItem(collectionName, options, function (result) {
            if (collectionName == "User") {
                req.session.user = result.data;
            }
            res.send(result.data);
        });
    });

    // edit existing item
    server.put("/api/:collectionName/:id", authenticateRequest, function (req, res) {
        var collectionName = req.params.collectionName;
        var id = req.params.id;
        var options = req.body;
        editCollectionItem(collectionName, id, options, function (result) {
            res.send(result.data);
        });
    })
}
/*********************************************************************************
                                METHODS      
/********************************************************************************/

// demo login method
var authenticateUser = function (email, password, callback) {
    // output to be returned
    var output = { success: false, message: "", data: {} };
    // open collection and search for user
    mongoDb.collection('User', function (err, collection) {
        if (!err) {
            var _username = email.indexOf("@") > -1 ? email.substring(0, email.indexOf("@")) : email;
            var _password = email.indexOf("@") > -1 ? crypto.createHash('md5').update(password).digest("hex") : password;
            // search collection
            collection.findOne({ username: _username, password: _password }, function (err, model) {
                // update output and return it
                if (!err && model) {
                    output.success = true;
                    output.userId = model._id;
                    var d = new Date().getTime();
                    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                        var r = (d + Math.random() * 16) % 16 | 0;
                        d = Math.floor(d / 16);
                        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
                    });
                    output.sessionId = uuid;
                    output.data = model;
                } else {
                    output.message = "The username or password is incorrect";
                }
                callback(output);
            });
        } else {
            output.message = "Could not connect to collection to authenticate user";
            callback(output);
        }
    })
}

// authenticate session
var authenticateSession = function (userId, callback) {
    if (userId) {
        mongoDb.collection('Session', function (err, collection) {
            if (!err) {
                var query = { session: { $regex: new RegExp(userId) } };
                collection.findOne(query, function (err, data) {
                    if (!err && data != null) {
                        var session = JSON.parse(data.session);
                        var date = new Date(session.cookie.expires);
                        if (date.getTime() > new Date().getTime()) {
                            logUserAction(session.user_id, req.route.path, req.route.method, data)
                            callback(true);
                        } else {
                            collection.remove(query, function (err, removed) {
                                callback(false);
                            })
                        }
                    } else {
                        callback(false);
                    }
                });
            } else {
                callback(false);
            }
        });
    } else {
        callback(false);
    }
}

// log a request
var logRequest = function (username, eventName, methodName, params, result) {

    mongoDb.collection('ActivityLog', function (err, collection) {
        if (!err) {
            var data = {
                username: username,
                timestamp: new Date().getTime(),
                method: methodName,
                event: eventName,
                params: params,
                result: result
            }
            collection.save(data, { safe: true }, function (err, item) {
                console.log("Logging Activity", data);
            })
        } else {

        }
    });

}

// register a user
var registerUser = function (email, callback) {
    var output = { success: false, message: "", data: {} };
    var username = email.substring(0, email.indexOf('@'));
    var password = Math.random().toString(36).substring(7);
    console.log(password);
    var encryptedPassword = crypto.createHash('md5').update(password).digest("hex")
    mongoDb.collection('User', function (err, collection) {
        if (!err) {
            var query =
            collection.count({ username: username }, function (err, count) {
                if (count == 0) {
                    var data = {
                        email: email,
                        username: username,
                        password: encryptedPassword,
                        timestamp: new Date().getTime()
                    }
                    collection.insert(data, { safe: true }, function (err, item) {
                        if (!err) {
                            output.success = true;
                            output.message = "Successfully registered user";
                            output.data = item[0];
                        } else {
                            output.message = "Could not insert user into collection";
                        }
                        callback(output);
                    })
                } else {
                    output.message = "Email address is already in use.";
                    callback(output);
                }
            });
        } else {
            output.message = "Could not connect to user collection";
            callback(output);
        }
    })
}

// get an entire collection by its name and return it in an array
var getCollectionList = function (collectionName, callback) {
    var cursorCount = 0;
    var items = [];
    mongoDb.collection(collectionName, function (err, collection) {
        
        var cursor = collection.find();
        cursor.count(function (err, count) {
            if (count > 0) {
                cursor.each(function (err, doc) {
                    if (!err) {
                        if (doc != null) {
                            items.push(doc);
                        }
                        cursorCount++;
                        if (cursorCount == count) {
                            callback(items);
                        }
                    }
                });
            } else {
                callback(items);
            }
        })
    });
}

// as per above method but with pagination, and sorting
var getCollectionListAdvanced = function (collectionName, options, callback) {
    var cursorCount = 0;
    var items = [];
    //var query = options.query ? options.query : {};           // { 'name' : 'shaun', 'details.age' : { $gte : 25 } }
    var limit = options.limit ? Number(options.limit) : 0;      // pagination : limit 10
    var skip = options.skip ? Number(options.skip) : 0;         //            : skip 10
    var sorter = { };
    var sort = options.sort ? options.sort : '_id';
    var dir = options.dir ? Number(options.dir) : 1;
    sorter[sort] = dir;
    mongoDb.collection(collectionName, function (err, collection) {
        // build the cursor based on the params
        var cursor = collection.find();
        if(limit > 0)
            cursor.limit(limit).skip(skip);
        cursor.sort(sorter);
        // get the count
        cursor.count(function (err, count) {
            var max = count > limit && limit != 0 ? limit : count;
            // loop through items and send to the callback method
            if (count > 0) {
                cursor.each(function (err, doc) {
                    if (!err) {
                        if (doc != null) {
                            items.push(doc);
                        }
                        if (cursorCount == max) {
                            callback(items);
                        }
                        cursorCount++;
                    }
                });
            } else {
                callback(items);
            }
        })
    });
}

// get a single collection by it's _id, toString to ObjectId so either can be sent in
var getCollectionItemById = function (collectionName, id, callback) {
    var output = { success: false, message: "", data: {} };
    mongoDb.collection(collectionName, function (err, collection) {
        var query = { "_id": new BSON.ObjectID(id.toString()) };
        collection.findOne(query, function (err, item) {
            if (!err) {
                output.success = true;
                output.data = item;
            } else {
                output.message = "Failed to retrieve item from DB";
            }
            callback(output);
        });
    });
}

// add a new item to a collection
var addCollectionItem = function (collectionName, options, callback) {
    var output = { success: false, message: "", data: {} };
    // do some validation here
    mongoDb.collection(collectionName, function (err, collection) {
        collection.insert(options, { safe: true }, function (err, item) {
            if (!err) {
                output.success = true;
                output.data = item[0];
            } else {
                output.message = "Failed to insert item into DB";
            }
            callback(output);
        });
    });
}

// edit a single item in a collection
var editCollectionItem = function (collectionName, id, options, callback) {
    var output = { success: false, message: "", data: {} };
    mongoDb.collection(collectionName, function (err, collection) {
        var query = { "_id": new BSON.ObjectID(id.toString()) };
        var set = { "$set" : options };
        collection.update(query, set, function (err, item) {
            if (!err) {
                output.success = true;
                output.data = item[0];
            } else {
                output.message = "Failed to insert item into DB";
            }
            callback(output);
        });
    });
}

// delete a item from a collection
var deleteCollectionItem = function (collectionName, id, callback) {
    var output = { success: false, message: "", data: {} };
    mongoDb.collection(collectionName, function (err, collection) {
        var query = { "_id": new BSON.ObjectID(id.toString()) };
        collection.remove(query, function (err, item) {
            if (!err) {
                output.success = true;
                output.data = item;
            } else {
                output.message = "Failed to insert item into DB";
            }
            callback(output);
        });
    });
}

