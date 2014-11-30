var jade = require('jade');


/*
 * Functions for handling various routing requests
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
        partialHTML = jade.renderFile('views/partials/home.jade', { user: req.session.username });
        loggedin = true
    } else if (path.indexOf('/logout') > -1) {
        partialHTML = jade.renderFile('views/partials/login.jade');
        loggedin = false
    }
    res.render('index', { title: 'MOVIES R\' US',  partial: partialHTML, status: loggedin });
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
        var partialHTML = jade.renderFile('views/partials/home.jade');
        res.render('index', { title: 'MOVIES R\' US', partial: partialHTML, user: req.session.username, loggedin: req.session } );
    }
};


// Rentals View
exports.rentals = function(req, res) {
    res.render('partials/home', { layout: false, user: req.session.username });
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
    //if (!req.session.username && req.body.username) {
    if (req.body.username) {
        req.session.save(function(err) {
            if (err) {
                console.log(err);
            } else {
                req.session.username = req.body.username;
                exports.renderInitialView(req, res);
            }
        });
    } else {
        res.render('partials/invalid', { layout: false });
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
