var jade = require('jade');
var dbc = require('../lib/databaseConnector.js');

/*
 * Functions for handling various routing requests for the CS345 IMDB Webapp
 * @author Derek Duoba
 */


/**
 * Full Pages
 */

// All pages
exports.renderFullPages = function(req, res) {
    var path = req.url.split('?')[0];
    var partialHTML;
    if (req.session.username) {
        if (path.indexOf('/login') > -1) {
            partialHTML = jade.renderFile('views/partials/home.jade', { user: req.session.username });
            loggedin = true;
        } else {
            partialHTML = jade.renderFile('views/partials' + path + '.jade');
        }
        res.render('index', { title: 'MOVIES R\' US',  partial: partialHTML, user: req.session.username, status: loggedin });
    } else {
        partialHTML = jade.renderFile('views/partials/login.jade');
        res.render('index', { title: 'MOVIES R\' US',  partial: partialHTML });
    }
}


// Login & logout upon initial entry
exports.renderInitialView = function(req, res) {
    var partialHTML;
    var path = req.url.split('?')[0];
    if (path.indexOf('/login') > -1) {
        //partialHTML = jade.renderFile('views/partials/home.jade', { user: req.session.username });
        loggedin = true
        var uid = req.session.uid;
        if (!uid) {
            console.log("ERROR: NO SESSION");
            result = 4;
            res.json(result);
        } else {
            dbc.getUserRentals(uid, function(err, data) {
                var partialHTML;
                if (err) {
                    console.log("ERROR");
                    console.log(err);
                    var e = "An error occured. Please try again.";
                    res.render('partials/movie_display_rentals', { error: e });
                } else {
                    console.log("USER RENTALS RETURNED!");
                    console.log(data);
                    var partialHTML1 = jade.renderFile('views/partials/movie_display_rentals.jade', { moviedata: data });
                    var partialHTML2 = jade.renderFile('views/partials/home.jade', { partial: partialHTML1 });
                    res.render('index', { title: 'MOVIES R\' US', partial: partialHTML2, status: true } );
                }
            });
        }
    } else if (path.indexOf('/logout') > -1) {
        partialHTML = jade.renderFile('views/partials/login.jade');
        loggedin = false
        res.render('index', { title: 'MOVIES R\' US',  partial: partialHTML, status: loggedin });
    }
}


/**
 * Partials
 */

// Index
exports.index = function(req, res){
    if (!req.session.username) {
        var partialHTML = jade.renderFile('views/partials/login.jade');
        res.render('index', { title: 'MOVIES R\' US', partial: partialHTML } ); 
    } else {
        //var partialHTML = jade.renderFile('views/partials/home.jade');
        //res.render('index', { title: 'MOVIES R\' US', partial: partialHTML, user: req.session.username, loggedin: req.session } );
        var uid = req.session.uid;
        if (!uid) {
            console.log("ERROR: NO SESSION");
            result = 4;
            res.json(result);
        } else {
            dbc.getUserRentals(uid, function(err, data) {
                var partialHTML;
                if (err) {
                    console.log("ERROR");
                    console.log(err);
                    var e = "An error occured. Please try again.";
                    res.render('partials/movie_display_rentals', { error: e });
                } else {
                    console.log("USER RENTALS RETURNED!");
                    console.log(data);
                    var partialHTML1 = jade.renderFile('views/partials/movie_display_rentals.jade', { moviedata: data });
                    var partialHTML2 = jade.renderFile('views/partials/home.jade', { partial: partialHTML1 });
                    res.render('index', { title: 'MOVIES R\' US', partial: partialHTML2, status: true } );
                }
            });
        }       
    }
};


// Rentals View
exports.rentals = function(req, res) {
    //res.render('partials/home', { layout: false, user: req.session.username });
    var uid = req.session.uid;
    if (!uid) {
        console.log("ERROR: NO SESSION");
        result = 4;
        res.json(result);
    } else {
        dbc.getUserRentals(uid, function(err, data) {
            var partialHTML;
            if (err) {
                console.log("ERROR");
                console.log(err);
                var e = "An error occured. Please try again.";
                res.render('partials/movie_display_rentals', { error: e });
            } else {
                console.log("USER RENTALS RETURNED!");
                console.log(data);
                //var partialHTML1 = jade.renderFile('views/partials/movie_display_rentals.jade', { moviedata: data });
                //var partialHTML2 = jade.renderFile('views/partials/home.jade', { partial: partialHTML1 });
                //res.render('index', { title: 'MOVIES R\' US', partial: partialHTML2, status: true } );
                partialHTML = jade.renderFile('views/partials/movie_display_rentals.jade', { moviedata: data });
                res.render('partials/home', { partial: partialHTML });
            }
        });
    }
};

// Search View
exports.search = function(req, res) {
    res.render('partials/search', { layout: false });
};

// Login View
exports.login = function(req, res) {
    if (!req.session.username) {
        res.render('partials/login', { layout: false });
    } else {
        res.render('partials/home', { layout: false, user: req.session.username });
    }
};


/**
 * Helper Functions
 */

// Login Submission
exports.loginSubmit = function(req, res) {
    if (req.body.username && req.body.password) {
        // Check for valid credentials
        // Test User: u: Tim,  pw: secret
        dbc.login(req.body.username, req.body.password, function(err, customer, success) {
            if (err) {
                console.log("ERROR");
                console.log(err);
                var partialHTML = jade.renderFile('views/partials/login.jade', { invalid: true });
                res.render('index', { title: 'MOVIES R\' US', partial: partialHTML } );        
            } else {
                if (success) {
                    req.session.save(function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.session.username = req.body.username;
                            req.session.name = customer.firstname + " " + customer.lastname;
                            req.session.uid = customer.uid;
                            console.log(req.session);
                            exports.renderInitialView(req, res);
                        }
                    });
                } else {
                    var partialHTML = jade.renderFile('views/partials/login.jade', { invalid: true });
                    res.render('index', { title: 'MOVIES R\' US', partial: partialHTML } );
                }
            }
        });
    } else {
        var partialHTML = jade.renderFile('views/partials/login.jade', { invalid: true });
        res.render('index', { title: 'MOVIES R\' US', partial: partialHTML } );
    }
}

// Logout
exports.logout = function(req, res) {
    if (req.session.username) {
        req.session.destroy(function(err) {
            if (err) {
                console.log(err);
            } else {
                req.session = null;
                exports.renderInitialView(req, res);
            }
        });
    }
}
