var winston = require('winston');
var jade = require('jade');

/** 
 * API functions used to read/write from/to the local MONGO DB
 **/

var OMDBAPIKEY = 'maybelater';

function isEmpty(str) {
    return (str === undefined || str.length === 0);
}

function isObjectEmpty(obj) {
    for(var property in obj) {
        if (obj.hasOwnProperty(property)) {
            return false;
        }
    }
    return true;
}

/*
 * Get a list of queries
 */
exports.getQueries = function(req, res) {
    var db = req.db;
    db.collection("querycollection").find().toArray(function (err, items) {
        res.json(items);   
    });
}


/**
 * Add query data to the DB (after a validation check)
 * Output Codes:
 * 0: success
 * 1: shortquery is missing or blank
 * 2: longquery is missing or blank
 * 3: no movies have been provided
 * 4: DB is broken
**/
exports.addQueryData = function(req, res) {
    var shortQuery = req.body.shortquery;
    var longQuery = req.body.longquery;
    var movies = req.body.movies;
    if (isEmpty(shortQuery)) {
        winston.log("ERROR 1: No shortquery specified");
        res.send("<p class='lead'>There's no short query!</p");
    } else if (isEmpty(longQuery)) {
        winston.log("ERROR 2: No longquery specified");
        res.send("<p class='lead'>There's no long query!</p>");
    } else if (isObjectEmpty(movies)) {
        winston.log("ERROR 3: No movies specified");
        res.send("<p class='lead'>There aren't any movies!</p>");
    } else {
        var db = req.db;
        var collection = db.collection("querycollection"); 
        collection.insert( { 
            "shortquery": shortQuery,
            "longquery": longQuery,
            "movies": movies
        }, function(err, doc) {
            if (err) {
                winston.log("ERROR 4: MongoDB error", { errordata: err });
                console.log(err);
                res.send("<p class='lead'>The form database is down. Please try again later.</p>");
            } else {
                winston.log("info", "SUCCESS 0: Sucessfully submitted query data");
                var successHTML = jade.renderFile("views/partials/success.jade"); 
                res.send(successHTML);
            }
        });
    } 
}


