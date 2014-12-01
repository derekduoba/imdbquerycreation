var pg = require('pg');

// DB connection strings, to be modified according to DB configuration
var imdbString = "postgres://postgres:admin@localhost/imdb";
var customerString = "postgres://postgres:admin@localhost/CUSTOMER"


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
                                            "rid": mid,
                                            "title": result.rows[0].name
                                        };
                                        if (returnObj.length == midSet.length) {
                                            done();
                                            client.end();
                                            pg.end();
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