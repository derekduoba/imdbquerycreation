
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var api = require('./routes/api.js');
var jade = require('jade');
var http = require('http');
var path = require('path');
var app = express();
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/querydata", {native_parser:true});

app.use(function(req,res,next){
    req.db = db;
    next();
});

var winston = require('winston');
winston.add(winston.transports.File, { filename: 'logs/nodejs.log' });
winston.handleExceptions(new winston.transports.File({ filename: 'logs/exceptions.log' }))
winston.log('info', 'Starting winston logger');

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
 * Routes
 */
app.get('/', routes.index);
app.get('/querylist', function(req, res) {
    api.getQueries(req, res);   
});
app.post('/api/sendquerydata', function(req, res) {
    api.addQueryData(req, res);
});

http.createServer(app).listen(app.get('port'), function(){
    winston.log('Express server listening on port ' + app.get('port'));
    console.log('Express server listening on port ' + app.get('port'));
});
