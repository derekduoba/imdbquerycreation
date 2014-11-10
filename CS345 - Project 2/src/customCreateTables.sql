/*
Login
uid, username, password

Contact
cid, first name, last name, phone number, email, address, city, state

Customer
uid, plantype, recorded rentals, number of rentals, maximum number of rentals

Rentals
rid, customer uid, status
--Removed Movies since it's apart of a separate database

*Removed*
-PastRentals
-rid, movies, customer uid

Rental plans
pid, max rentals, fees, duration
*/

DROP TABLE LOGIN;
DROP TABLE CONTACTINFO;
DROP TABLE CUSTOMER;
DROP TABLE RENTALS;
DROP TABLE RENTALPLANS

CREATE TABLE LOGIN(
lid integer FOREIGN KEY REFERENCES Customer (uid),
username varchar(30),
password varchar(30)
);

CREATE TABLE CONTACTINFO(
cid integer FOREIGN KEY REFRENCES CUSTOMER (uid),
firstname varChar(30),
lastname varChar(30),
email varChar(30),
address varChar(30),
city varChar(30),
state varchar(30)
);

CREATE TABLE CUSTOMER(
uid integer PRIMARY KEY,
plid varchar(30) FOREIGN KEY REFERENCES RENTALPLANS (plid),
rid varchar(30) FOREIGN KEY REFERENCES RENTALS (rid),
number_rented integer,
max_rentals integer
);

CREATE TABLE RENTALS(
rid integer UNIQUE,
uid FOREIGN KEY REFERENCES CUSTOMER (uid),
status VARCHAR(10) CHECK (status = 'open' or status = 'closed')
);

//Added the name field
CREATE TABLE RENTALPLANS(
plid integer PRIMARY KEY,
name VARCHAR(50) UNIQUE NOT NULL,
max_rentals integer,
cost float,
months_subscribed integer
);
