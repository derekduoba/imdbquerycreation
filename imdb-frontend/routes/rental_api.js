/**
 * Search functions for the CS345 IMDB Webapp
 * @author: Derek Duoba
 **/

var express = require('express');
var router = express.Router();
var dbc = require('../lib/databaseConnector.js');

exports.searchMovies = function(req, res) {
    
    console.log("SEARCH MOVIES INVOKED!");
    
    var searchString = req.body.title;
    
    dbc.searchMovies(0, searchString, function(err, data) {
        if (err) {
            console.log("AN ERROR OCCURED!");
            console.log(err);
            var e = "An error occured. Please Try again.";
            res.render('partials/movie_display', { error: e });
        } else {
            console.log("MOVIE DATA RETURNED!");
            console.log(data);
            res.render('partials/movie_display', { moviedata: data });
        }
    });


}
