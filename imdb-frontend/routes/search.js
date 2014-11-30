/**
 * Search functions for the CS345 IMDB Webapp
 * @author: Derek Duoba
 **/

var express = require('express');
var router = express.Router();
var dbc = require('../lib/databaseConnector.js');

exports.searchMovies = function(req, res) {
    var movieData = {};
    var searchString = req.body.title;
    dbc.searchMovies(searchString, function(data, err) {
        if (err) {
            console.log(err);
            var e = "An error occured. Please Try again";
            res.render('partials/movie_display', { error: e });
        } else {
            res.render('partials/movie_display', { moviedata: data });
        }
    });
}
