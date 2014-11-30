
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

//var memStore = express.session.MemoryStore;
var memStore = require('memstore').Store;
var store = new memStore();

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('1234567890QWERTY'));
app.use(express.session({ secret: "verysecret" }));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/*
 * Views
 */
app.get('/', routes.index);

app.get('/rentals', function(req, res) {
    if (req.query.internal) {
        console.log("RENTALS INTERNAL!");
        routes.rentals(req, res);
    } else {
        console.log("RENTALS EXTERNAL!");
        req.url = "/login"; // Quick & dirty hack to redirect to the login (home) view
        routes.renderFullPages(req, res);
    }
});

app.get('/search', function(req, res) {
    if (req.query.internal) {
        console.log("SEARCH INTERNAL!");
        routes.search(req, res);
    } else {
        console.log("SEARCH EXTERNAL!");
        routes.renderFullPages(req, res);
    }
});

app.get('/login', function(req, res) {
    if (req.query.internal) {
        console.log("LOGIN INTERNAL!");
        routes.login(req, res);
    } else {
        console.log("LOGIN EXTERNAL!");
        routes.renderFullPages(req, res);
    }
});

app.post('/login', routes.loginSubmit);
app.post('/logout', routes.logout);
app.post('/search', routes.searchMovies);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
