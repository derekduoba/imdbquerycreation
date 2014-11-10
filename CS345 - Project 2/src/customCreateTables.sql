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
pid, name, max rentals, fees, duration
*/

DROP TABLE LOGIN cascade;
DROP TABLE CONTACTINFO cascade;
DROP TABLE CUSTOMER cascade;
DROP TABLE RENTALS cascade;
DROP TABLE RENTALPLANS cascade;

--//Added the name field
CREATE TABLE RENTALPLANS(
plid integer PRIMARY KEY,
name VARCHAR(50) UNIQUE NOT NULL,
max_rentals integer,
cost float,
months_subscribed integer
);

CREATE TABLE CUSTOMER(
uid integer PRIMARY KEY,
plid integer REFERENCES RENTALPLANS (plid),
number_rented integer,
);

CREATE TABLE RENTALS(
rid integer UNIQUE,
uid integer REFERENCES CUSTOMER (uid),
status VARCHAR(10) CHECK (status = 'open' or status = 'closed')
);

CREATE TABLE LOGIN(
lid integer REFERENCES CUSTOMER (uid),
username varchar(30),
password varchar(30)
);

CREATE TABLE CONTACTINFO(
cid integer REFERENCES CUSTOMER (uid),
firstname varChar(30),
lastname varChar(30),
email varChar(30),
address varChar(30),
city varChar(30),
state varchar(30)
);

INSERT INTO RENTALPLANS VALUES(1, premium, 20, 19.99, 6);
INSERT INTO RENTALPLANS VALUES(2, gold, 10, 9.99, 6);

INSERT INTO CUSTOMER VALUES(1, 1, 3, );
