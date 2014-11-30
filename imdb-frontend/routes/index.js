var jade = require('jade');


/*
 * GET home page and various partials
 */

var last = "none";

/**
 * Full Pages
 */

// All pages
exports.renderFullPages = function(req, res) {
    var path = req.url.split('?')[0];
    var partialHTML;
    if (req.session.username) {
        console.log(req.session.username);
        if (path.indexOf('/login') > -1) {
            partialHTML = jade.renderFile('views/partials/home.jade', { user: req.session.username });
            loggedin = true;
            res.render('index', { title: 'MOVIES R\' US',  partial: partialHTML, user: req.session.username, status: loggedin });
        } else {
            partialHTML = jade.renderFile('views/partials' + path + '.jade');
            res.render('index', { title: 'MOVIES R\' US',  partial: partialHTML, user: req.session.username, status: loggedin });
        }
    } else {
        partialHTML = jade.renderFile('views/partials/login.jade');
        res.render('index', { title: 'MOVIES R\' US',  partial: partialHTML });
    }
}


// Login & logout
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
    res.render('index', { title: 'MOVIESs R\' US',  partial: partialHTML, status: loggedin });
}


/**
 * Partials
 */

// Index
exports.index = function(req, res){
    if (req.session.lastPage) {
        last = req.session.lastPage;
    }
    req.session.lastPage = "none";

    if (!req.session.username) {
        console.log("USER IS NOT LOGGED IN");
        var partialHTML = jade.renderFile('views/partials/login.jade');
        res.render('index', { title: 'Movies R\' Us', partial: partialHTML, loggedin: req.session } ); 
    } else {
        console.log("USER IS LOGGED IN");
        var partialHTML = jade.renderFile('views/partials/home.jade');
        res.render('index', { title: 'Movies R\' Us', partial: partialHTML, user: req.session.username, loggedin: req.session } );
    }
};


// View A
exports.a = function(req, res) {
    if (req.session.lastPage) {
        last = req.session.lastPage;
    }
    req.session.lastPage = "/a";
    res.render('partials/a', { layout: false, test: last });
};

// View B
exports.b = function(req, res) {
    if (req.session.lastPage) {
        last = req.session.lastPage;
    }
    req.session.lastPage = "/b";
    res.render('partials/b', { layout: false, test: last });
};

// Login View
exports.login = function(req, res) {
    if (req.session.lastPage) {
        last = req.session.lastPage;
    }
    req.session.lastPage = "/login";
    
    if (!req.session.username) {
        res.render('partials/login', { layout: false, test: last });
    } else {
        console.log(req.session.username);
        res.render('partials/home', { layout: false, test: last, user: req.session.username });
    }
};


/**
 * Helper Functions
 */

// Login Submission
exports.loginSubmit = function(req, res) {
    if (req.session.lastPage) {
        last = req.session.lastPage;
    }
    req.session.lastPage = "/login";

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
        res.render('partials/invalid', { layout: false, test: last });
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
