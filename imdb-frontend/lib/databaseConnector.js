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
    	var SQLQuery = "SELECT cid, login, fname, lname, pid FROM Customers WHERE login=$1 AND password=$2";

    	client.query({ text : SQLQuery,
                     values : [login, password]},
        function (err, result) {
        // Ends the "transaction":
        done();
        
        if (err) {
          callback(err, undefined, false);
        }
        else 
        {
			if(result.rows.length > 0)
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
			}else{
				callback({success:"false", message:"invalid login"}, undefined, false);
			}
        }
      });
    }
  });
}