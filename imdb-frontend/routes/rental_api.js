/**
 * Search functions for the CS345 IMDB Webapp
 * @author: Derek Duoba
 **/

var express = require('express');
var router = express.Router();
var dbc = require('../lib/databaseConnector.js');
var jade = require('jade');

exports.searchMovies = function(req, res) {
    
    console.log("SEARCH MOVIES INVOKED!");
    
    var searchString = req.body.title;
    
    dbc.searchMovies(0, searchString, function(err, data) {
        if (err) {
            console.log("AN ERROR OCCURED!");
            console.log(err);
            var e = "An error occured. Please Try again.";
            res.render('partials/movie_display_search', { error: e });
        } else {
            console.log("MOVIE DATA RETURNED!");
            console.log(data);
            res.render('partials/movie_display_search', { moviedata: data });
        }
    });
}

exports.rentMovie = function(req, res) {
    var movieID = req.body.movieid;
    console.log(movieID);
    console.log(req.session);
    //if (!req.session.id) {
    if (0) {
            console.log("ERROR: NO SESSION");
            result = 4;
            res.json(result);
    } else {
        //dbc.rentMovie(req.session.uid, movieID, function(err, result) {
        dbc.rentMovie(1, movieID, function(err, result) {
            if (err) {
                console.log("ERROR");
                console.log(err);
                result = 4;
                res.json(result);
            } else {
                console.log("SUCCESS!");
                console.log(result);
                res.json(result);
            }
        });
    }
}

exports.getRentals = function(req, res) {
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
                res.render('partials/movie_display_rentals', { moviedata: data });
            } else {
                console.log("USER RENTALS RETURNED!");
                console.log(data);
                partialHTML = jade.renderFile('views/partials/movie_dispaly_rentals.jade', { moviedata: data });
                //res.render('partials/movie_display_rentals', { partial: partialHTML });
                res.send(partialHTML);
            }
        });
    }
}


exports.returnMovie = function(req, res) {
    var movieID = req.body.movieid;
    console.log(movieID);
    console.log(req.session);
    //if (!req.session.id) {
    if (0) {
        console.log("ERROR: NO SESSION");
        result = 4;
        res.json(result);
    } else {
        //dbc.returnMovie(req.session.uid, movieID, function(err, result) {
        dbc.returnMovie(1, movieID, function(err, result) {
            if (err) {
                console.log("ERROR");
                console.log(err);
                result = 4;
                res.json(result);
            } else {
                console.log("SUCCESS!");
                console.log(result);
                res.json(result);
            }
        });
    }   
}

