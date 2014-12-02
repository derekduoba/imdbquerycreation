var pg = require('pg');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// DB connection strings, to be modified according to DB configuration
var imdbString = "postgres://dduoba:password@localhost/imdb";

var customerString = "postgres://dduoba:password@localhost/customer"


/*
This is called when a user wants to login.

Params
@login: the username of a user
@password the password of a user

Returns 
@err: if a connection problem arises, this will contain said info, undefined otherwise
@customer(uid, firstname, lastname, email, address, city, state): the customer data of matching customer's username/pass
@success(boolean): true if user found for username/password combo, false if not(Such as bad username/pass/err)
*/
exports.login = function(login, password, callback) {
    pg.connect(customerString, function(err, client, done) {
        if (err) {
            callback(err);
        } else {
            var uidQuery = "SELECT lid FROM LOGIN WHERE username=$1 AND password=$2";
            var contactQuery = "SELECT cid, firstname, lastname, email, address, city, state FROM CONTACTINFO WHERE cid = $1";

            client.query({
                    text: uidQuery,
                    values: [login, password]
                },
                function(err, result) {

                    if (err) {
                        callback(err, undefined, false);
                    } else {
                        if (result.rows.length > 0) {

                            client.query({
                                    text: contactQuery,
                                    values: [result.rows[0].lid]
                                },
                                function(err, result) {
                                    if (err) {
                                        callback(err, undefined, false);
                                    } else {
                                        // Ends the "transaction":
                                        done();
                                        // Disconnects from the database
                                        client.end();
                                        // This cleans up connected clients to the database and allows subsequent requests to the database
                                        pg.end();

                                        var returnObj = {};
                                        returnObj.uid = result.rows[0].cid;
                                        returnObj.firstname = result.rows[0].firstname;
                                        returnObj.lastname = result.rows[0].lastname;
                                        returnObj.email = result.rows[0].email;
                                        returnObj.address = result.rows[0].address;
                                        returnObj.city = result.rows[0].city;
                                        returnObj.state = result.rows[0].state;

                                        callback(undefined, returnObj, true);

                                    }
                                });
                        } else {
                            callback({
                                success: "false",
                                message: "invalid login"
                            }, undefined, false);
                        }
                    }
                });
        }
    });
}

// Helper function that gets ids of rental movies for this user
getRentedMids = function(uid, callback) {
    pg.connect(customerString, function(err, client, done) {
        if (err) {
            callback(err);
        } else {
            var midQuery = "SELECT R.rid FROM Rentals R WHERE R.uid = $1";

            client.query({
                    text: midQuery,
                    values: [uid]
                },
                function(err, result) {
                    // Ends the "transaction":
                    done();

                    if (err) {
                        callback(err, undefined, false);
                    } else {
                        // Disconnects from the database
                        client.end();
                        // This cleans up connected clients to the database and allows subsequent requests to the database
                        pg.end();
                        callback(undefined, result.rows, true);
                    }
                });
        }
    });
}

/*
This is called when a user wants to see their ongoing rentals.

Params
@uid: user ID

Returns 
@err: if a connection problem arises, this will contain said info, undefined otherwise
@rentalArray of this structure: [{"rid":243,"title":"Aile kadini"},{"rid":243,"title":"Bingo"}] where rid is equivalent to mid
*/
exports.getUserRentals = function(uid, callback) {
    getRentedMids(uid, function(err, midSet, suc) {
        if (err) {
            callback(err);
            console.log("BAD ERROR");
        } else {
            pg.connect(imdbString, function(err, client, done) {
                if (err) {
                    callback(err);
                } else {
                    var titleQuery = "SELECT name FROM MOVIE WHERE id = $1";
                    var returnObj = [];
                    if (midSet.length > 0) {
                        for (i = 0; i < midSet.length; i++) {
                            var mid = midSet[i].rid;
                            client.query({
                                    text: titleQuery,
                                    values: [mid]
                                },
                                function(err, result) {
                                    if (err) {
                                        callback(err, undefined);
                                    } else {
                                        returnObj[returnObj.length] = {
                                            "title": result.rows[0].name
                                        };
                                        if (returnObj.length == midSet.length) {
                                            done();
                                            client.end();
                                            pg.end();
											for (i = 0; i < midSet.length; i++) {
												returnObj[i].rid = midSet[i].rid;
											}
                                            callback(undefined, returnObj);
                                        }
                                    }
                                });
                        }
                    } else {
                        callback(undefined, returnObj);
                    }
                }
            });
        }
    });
}

getMovieDetails = function(title, callback) {
    pg.connect(imdbString, function(err, client, done) {
        if (err) {
            callback(err);
        } else {
            var Query = "SELECT m.id, m.name, m.year FROM movie as m WHERE LOWER(m.name) like LOWER($1) ORDER BY m.id";

            client.query({
                    text: Query,
                    values: ['%' + title + '%']
                },
                function(err, result) {
                    // Ends the "transaction":
                    done();

                    if (err) {
                        callback(err, undefined, false);
                    } else {
                        // Disconnects from the database
                        client.end();
                        // This cleans up connected clients to the database and allows subsequent requests to the database
                        pg.end();

                        callback(undefined, result.rows, true);
                    }
                });
        }
    });
}

getMovieActors = function(title, callback) {
    getMovieDetails(title, function(err, movieDetails, success) {
        if (err) {
            callback(err);
            console.log("BAD ERROR");
        } else {
            pg.connect(imdbString, function(err, client, done) {
                if (err) {
                    callback(err);
                } else {
                    var Query = "SELECT m.id, a.fname, a.lname FROM actor as a INNER JOIN casts as c ON a.id=c.pid INNER JOIN movie as m ON c.mid=m.id WHERE LOWER(m.name) like LOWER($1) ORDER BY m.id";

                    client.query({
                            text: Query,
                            values: ['%' + title + '%']
                        },
                        function(err, result) {
                            // Ends the "transaction":
                            done();

                            if (err) {
                                callback(err, undefined, false);
                            } else {
                                // Disconnects from the database
                                client.end();
                                // This cleans up connected clients to the database and allows subsequent requests to the database
                                pg.end();

                                callback(undefined, movieDetails, result.rows, true);
                            }
                        });
                }
            });
        }
    });
}

getMovieDirectors = function(title, callback) {
    getMovieActors(title, function(err, movieDetails, movieActors, success) {
        if (err) {
            callback(err);
            console.log("BAD ERROR");
        } else {
            pg.connect(imdbString, function(err, client, done) {
                if (err) {
                    callback(err);
                } else {
                    var Query = "SELECT m.id, d1.fname, d1.lname FROM directors as d1 INNER JOIN movie_directors as d2 ON d1.id=d2.did INNER JOIN movie as m ON m.id=d2.mid WHERE LOWER(m.name) like LOWER($1) ORDER BY m.id";

                    client.query({
                            text: Query,
                            values: ['%' + title + '%']
                        },
                        function(err, result) {
                            // Ends the "transaction":
                            done();

                            if (err) {
                                callback(err, undefined, false);
                            } else {
                                // Disconnects from the database
                                client.end();
                                // This cleans up connected clients to the database and allows subsequent requests to the database
                                pg.end();
                                callback(undefined, movieDetails, movieActors, result.rows, true);
                            }
                        });
                }
            });
        }
    });
}

exports.searchMovies = function(uid, movieTitle, callback) {
    getMovieDirectors(movieTitle, function(err, movieDetails, movieActors, movieDirectors, success) {
        if (err) {
            callback(err);
            console.log("BAD ERROR");
        } else {
            var returnObject = [];
            for (i = 0; i < movieDetails.length; i++) {
                var currentResult = {};
                var currentID = movieDetails[i].id;
                currentResult.mid = currentID;
                currentResult.title = movieDetails[i].name;
                currentResult.year = movieDetails[i].year;

                var directorArray = [];
                for (ii = 0; ii < movieDirectors.length; ii++) {
                    if (currentID == movieDirectors[ii].id) {
                        var currentDirector = {};
                        currentDirector.fname = movieDirectors[ii].fname;
                        currentDirector.lname = movieDirectors[ii].lname;
                        directorArray[directorArray.length] = currentDirector;
                    }
                }
                currentResult.directors = directorArray;

                var actorArray = [];
                for (iii = 0; iii < movieActors.length; iii++) {
                    if (currentID == movieActors[iii].id) {
                        var currentActor = {};
                        currentActor.fname = movieActors[iii].fname;
                        currentActor.lname = movieActors[iii].lname;
                        actorArray[actorArray.length] = currentActor;
                    }
                }
                currentResult.actors = actorArray;

                pg.connect(customerString, function(err, client, done) {
                    if (err) {
                        callback(err);
                    } else {
                        var statusQuery = "SELECT * FROM rentals WHERE rid = $1";
                        client.query({
                                text: statusQuery,
                                values: [currentID]
                            },
                            function(err, result) {
                                // Ends the "transaction":


                                if (err) {
                                    callback(err, undefined, false);
                                } else {


                                    if (result.rows.length > 0) {
                                        var rental_uid = result.rows[0].uid;
                                        if (rental_uid == uid) {
                                            currentResult.status = "YOU HAVE IT";
                                        } else {
                                            currentResult.status = "UNAVAILABLE";
                                        }
                                    } else {
                                        currentResult.status = "AVAILABLE";
                                    }
									currentResult.poster = getPosterUrl(currentResult.title);
                                    returnObject[returnObject.length] = currentResult;
                                    done();
                                    if (returnObject.length == movieDetails.length) {
                                        client.end();
                                        pg.end();
                                        callback(undefined, returnObject);
                                    }

                                }
                            });
                    }
                });
            }

        }
    });
}

function getPosterUrl(title) {
    return "http://ia.media-imdb.com/images/M/MV5BMjExNzM0NDM0N15BMl5BanBnXkFtZTcwMzkxOTUwNw@@._V1_SX300.jpg";
}

/*
function getPosterUrl(title)
{
	var processed = title.replace(" ", "+");
	var url = "http://www.omdbapi.com/?t=" + processed + "&y=&plot=short&r=json"
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false );
    xmlHttp.send( null );
    var res = JSON.parse(xmlHttp.responseText);
	
    if(res.Poster=="N/A"){
		return "https://s.ytimg.com/yts/img/no_thumbnail-vfl4t3-4R.jpg";
	} else {
		return res.Poster;
	}
}
*/
