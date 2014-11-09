/*
Login
uid, username, password

Contact
cid, first name, last name, phone number, email, address, city, state

Customer
uid, plantype, recorded rentals, number of rentals, maximum number of rentals

Rentals
rid, movies, customer uid, status

*Removed*
-PastRentals
-rid, movies, customer uid

Rental plans
pid, max rentals, fees, duration
*/

CREATE TABLE LOGIN(
lid integer FOREIGN KEY REFRENCES Customer (uid),
username varchar(30),
password varchar(30)
);

CREATE TABLE ContactInfo(
cid integer FOREIGN KEY REFRENCES Customer (uid),
firstname varChar(30),
lastname varChar(30),
email varChar(30),
address varChar(30),
city varChar(30),
state varchar(30)
);

CREATE TABLE Customer(
uid integer PRIMARY KEY,
tid varchar(30) FOREIGN KEY REFRENCES RENTALPLANS (pid),
rid varchar(30) FOREIGN KEY REFRENCES RENTALS (rid),
number_rented integer,
max_rentals integer
);

CREATE TABLE RENTALS(
rid integer UNIQUE,
mid FOREIGN KEY REFRENCES MOVIES (mid),
uid FOREIGN KEY REFRENCES Customer (uid),
status VARCHAR(10) CHECK (status = 'open' or status = 'closed')
);

//Added the name field
CREATE TABLE RENTALPLANS(
pid integer PRIMARY KEY,
name VARCHAR(50) UNIQUE NOT NULL,
max_rentals integer,
cost float,
months_subscribed integer
);
