var http = require('http');
var connector = require('./lib/databaseConnector.js');
/* Configure our HTTP server to respond with Hello World to all requests.
connector.login("Tim", "secret", function(err, customer, success){
console.log(err);
console.log(customer);
console.log(success);
});*/


/*
connector.getUserRentals(1, function(err, rentalArray, success){
console.log("ERROR: " + err);
console.log("RENTALS: " + JSON.stringify(rentalArray));
console.log("SUCCESS" + success);
});*/

/**/
connector.searchMovies(1, "hot tub time machine", function(err, results){
console.log("ERROR: " + err);
console.log("RESULTS: " + JSON.stringify(results));
});