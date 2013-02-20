/*********************************************************************************
	Dependencies
/********************************************************************************/
var BSON = require('mongodb').BSONPure,
    crypto = require('crypto');
/*********************************************************************************
	Methods - exported so available from anywhere
			- requires init to set the database to be used by the methods
/********************************************************************************/
module.exports = {
	
	db: null,

	init: function(db) {
		this.db = db;
	},
	
	// authenticate session
	authenticateSession : function (userId, callback) {
	    if (userId) {
	        this.db.collection('Session', function (err, collection) {
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
	},

	// demo login method
	authenticateUser : function (email, password, callback) {
	    // output to be returned
	    var output = { success: false, message: "", data: {} };
	    // open collection and search for user
	    this.db.collection('User', function (err, collection) {
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
	},

	// log a request
	logRequest : function (username, eventName, methodName, params, result) {

	    this.db.collection('ActivityLog', function (err, collection) {
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

	},

	// register a user
	registerUser : function (email, callback) {
	    var output = { success: false, message: "", data: {} };
	    var username = email.substring(0, email.indexOf('@'));
	    var password = Math.random().toString(36).substring(7);
	    console.log(password);
	    var encryptedPassword = crypto.createHash('md5').update(password).digest("hex")
	    this.db.collection('User', function (err, collection) {
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
	},

	// get an entire collection by its name and return it in an array
	getCollectionList : function (collectionName, callback) {
	    var cursorCount = 0;
	    var items = [];
	    this.db.collection(collectionName, function (err, collection) {

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
	},

	// as per above method but with pagination, and sorting
	getCollectionListAdvanced : function (collectionName, options, callback) {
	    var cursorCount = 0;
	    var items = [];
	    //var query = options.query ? options.query : {};           // { 'name' : 'shaun', 'details.age' : { $gte : 25 } }
	    var limit = options.limit ? Number(options.limit) : 0;      // pagination : limit 10
	    var skip = options.skip ? Number(options.skip) : 0;         //            : skip 10
	    var sorter = { };
	    var sort = options.sort ? options.sort : '_id';
	    var dir = options.dir ? Number(options.dir) : 1;
	    sorter[sort] = dir;
	    this.db.collection(collectionName, function (err, collection) {
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
	},

	// get a single collection by it's _id, toString to ObjectId so either can be sent in
	getCollectionItemById : function (collectionName, id, callback) {
	    var output = { success: false, message: "", data: {} };
	    this.db.collection(collectionName, function (err, collection) {
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
	},

	// add a new item to a collection
	addCollectionItem : function (collectionName, options, callback) {
	    var output = { success: false, message: "", data: {} };
	    // do some validation here
	    this.db.collection(collectionName, function (err, collection) {
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
	},

	// edit a single item in a collection
	editCollectionItem : function (collectionName, id, options, callback) {
	    var output = { success: false, message: "", data: {} };
	    this.db.collection(collectionName, function (err, collection) {
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
	},

	// delete a item from a collection
	deleteCollectionItem : function (collectionName, id, callback) {
	    var output = { success: false, message: "", data: {} };
	    this.db.collection(collectionName, function (err, collection) {
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
}
/*********************************************************************************
     End
/********************************************************************************/