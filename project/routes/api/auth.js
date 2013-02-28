/*********************************************************************************
	Dependencies
/********************************************************************************/
// get passport from parents
var passport = module.parent.exports.passport;
/*********************************************************************************
                                ROUTES     
/********************************************************************************/
module.exports = function (app) {
    // auth for twitter and google accounts
	app.get('/auth/twitter', passport.authenticate('twitter'));
	app.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/authcallback#success', failureRedirect: '/authcallback#error' }));
    
	// google
	app.get('/auth/google', passport.authenticate('google'));
	app.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/authcallback#success', failureRedirect: '/authcallback#error' }));
    
    // // popup auth hack
	app.get("/authcallback", function (req, res) {
	    var script = '<script type="text/javascript">opener.windowAuth(window.location.hash);window.close();</script>';
	    res.send(script);
	});
}
/*********************************************************************************
     End
/********************************************************************************/