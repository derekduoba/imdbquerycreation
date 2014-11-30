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
@customer(cid, login, fname, lname, pid): the customer data of matching customer's username/pass
@success(boolean): true if user found for username/password combo, false if not(Such as bad username/pass/err)
*/
exports.login = function(login, password, callback)
{
	pg.connect(customerString, function (err, client, done) {
    if (err) {
      callback(err);
    }
    else {
    	var uidQuery = "SELECT lid FROM LOGIN WHERE username=$1 AND password=$2";
		var contactQuery = "SELECT cid, firstname, lastname, email, address, city, state FROM CONTACTINFO WHERE cid = $1";

    	client.query({ text : uidQuery,
                     values : [login, password]},
        function (err, result) {
        
        if (err) {
          callback(err, undefined, false);
        }
        else 
        {
			if(result.rows.length > 0)
			{
			
				client.query({ text : contactQuery,
                     values : [result.rows[0].lid]},
				function (err, result) {
					if (err) {
						callback(err, undefined, false);
					}
					else 
					{
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
			}else{
				callback({success:"false", message:"invalid login"}, undefined, false);
			}
        }
      });
    }
  });
}

//non-functional, in progress
exports.getUserRentals = function(cid, callback)
{
	pg.connect(customerString, function (err, client, done) {
    if (err) {
      callback(err);
    }
    else {
    	var SQLQuery = "SELECT R.rid FROM Rentals R WHERE R.uid == $1";

    	client.query({ text : SQLQuery,
                     values : [cid]},
        function (err, result) {
        // Ends the "transaction":
        done();
        
        if (err) {
          callback(err, undefined, false);
        }
        else 
        {
			// Disconnects from the database
			client.end();
			// This cleans up connected clients to the database and allows subsequent requests to the database
			pg.end();
			
			
			
			
			
				pg.connect(customerString, function (err, client, done) {
    if (err) {
      callback(err);
    }
    else {
    	var SQLQuery = "SELECT R.rid FROM Rentals R WHERE R.uid == $1";

    	client.query({ text : SQLQuery,
                     values : [cid]},
        function (err, result) {
        // Ends the "transaction":
        done();
        
        if (err) {
          callback(err, undefined, false);
        }
        else 
        {
			// Disconnects from the database
			client.end();
			// This cleans up connected clients to the database and allows subsequent requests to the database
			pg.end();
			
			var returnObj = {};
			returnObj.cid = result.rows[0].cid;
			returnObj.login = result.rows[0].login;
			returnObj.fname = result.rows[0].fname;
			returnObj.lname = result.rows[0].lname;
			returnObj.pid = result.rows[0].pid;
			
			callback(undefined, returnObj, true);
        }
      });
    }
  });
			
			
			
			
			
			
			
			var returnObj = {};
			returnObj.cid = result.rows[0].cid;
			returnObj.login = result.rows[0].login;
			returnObj.fname = result.rows[0].fname;
			returnObj.lname = result.rows[0].lname;
			returnObj.pid = result.rows[0].pid;
			
			callback(undefined, returnObj, true);
        }
      });
    }
  });
}