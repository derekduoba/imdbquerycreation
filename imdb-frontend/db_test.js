var http = require('http');
var connector = require('./databaseConnector.js');
var username = "Tim";
var password = "secret";
var movieName = "hot tub time machine";
var movieID = 3003;
var uid;

/* AUTOMATED TESTING */
console.log("\n=== 1: Testing login using Username: " + username + " and Password: " + password+ " ===");
connector.login(username, password, function (err, customer, success) {
    if (err) console.log("\nERROR:\n" + err);
    //console.log(success);
    if (customer) {
        console.log("\nCUSTOMER\n" + JSON.stringify(customer));
        uid = customer.uid;
		console.log("\n=== 2: Testing getUserRentals ===");
        connector.getUserRentals(uid, function (err, rentalArray, success) {
            if (err) console.log("\nERROR:\n" + err);
            if (rentalArray) {
                console.log("\nRENTALS:\n" + JSON.stringify(rentalArray));
				console.log("\n=== 3: Testing searchMovie using movie name " + movieName + " ===");
                connector.searchMovies(uid, movieName, function (err, results) {
                    if (err) console.log("\nERROR:\n" + err);
                    if (results.length>0) {
                        console.log("\nRESULTS:\n" + JSON.stringify(results));
						console.log("\nNumber of results: " + results.length);
						console.log("\n=== 4: Testing rentMovie using movie ID " + movieID + " ===");
                        connector.rentMovie(uid, movieID, function (err, result) {
                            if (err) console.log("\nERROR:\n" + err)
                            if (result == 0) {
                                console.log("\nRESULT:\n" + result);
								console.log("\n=== 5: Testing returnMovie using movie ID " + movieID + " ===");
                                connector.returnMovie(uid, movieID, function (err, result) {
                                    if (err) console.log("\nERROR:\n" + err);
                                    if (result == 0) {
                                        console.log("\nRESULT:\n" + result);
										console.log("\nALL TESTS PASSED!\n\n");
                                    } else {
                                        console.log("Test failed: Result == " + result);
                                    }
                                });
                            } else {
                                console.log("Test failed: Result == " + result);
                            }
                        });
                    } else {
                        console.log("Test failed: Results array was empty.");
                    }
                });
            } else {
                console.log("Test failed");
            }
        });
    } else {
        console.log("Test failed");
    }

});
			


// MANUAL TESTING

/*
connector.login("Tim", "secret", function(err, customer, success){
console.log(err);
console.log(customer);
console.log(success);
});
*/

/*
connector.getUserRentals(1, function(err, rentalArray, success){
console.log("ERROR: " + err);
console.log("RENTALS: " + JSON.stringify(rentalArray));
console.log("SUCCESS" + success);
});
*/

/*
connector.searchMovies(1, "titanic", function(err, results){
console.log("ERROR: " + JSON.stringify(err));
console.log("RESULTS: " + JSON.stringify(results));
});
*/

/*
connector.rentMovie(1, 300, function(err, result){
console.log("ERROR: " + err);
console.log("RESULT: " + result);
});
*/

/*
connector.returnMovie(1, 244, function(err, result){
console.log("ERROR: " + err);
console.log("RESULT: " + result);
});
*/
