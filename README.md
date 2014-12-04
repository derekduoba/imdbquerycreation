cs345-imdb-movie-rentals
========================

INTRO:
Mock movie rental system that uses a dump of the IMDB database from 2010 (link below) to allow
users to search for, rent, and return movies.

This application uses Node.js, Express, PostgreSQL, and jQuery. The original database design is based off the
homeworks and group projects from CS345 @ UMass Amherst (Fall 2014).

http://avid.cs.umass.edu/courses/345/f2014/index.html

INSTRUCTIONS:
* The following assumes some familiarity with linux, node.js, and postgresql.

1.) Grab the respository


2.) Create an imdb database in Postgres, and download & import the IMDB2010 dataset:

http://avid.cs.umass.edu/courses/345/f2014/data/imdb2010.zip

(instructions for adding the database: http://avid.cs.umass.edu/courses/345/f2014/hw/hw1.html)


3.) Create a CUSTOMER database and import the schema in:

CS345 - Project 2/src/customCreateTables.sql

(The data import can be done using the same methods outline in step 2)
 

 4.) Copy 
 
 imdb-movie-rentals/imdb-frontend/lib/databaseConnector.js.working.2
 
 to
 
 imdb-movie-rentals/imdb-frontend/lib/databaseConnector.js.working.2 
 
 and update lines 10 and 11 to match the access credentials of your local system.
 

 5.) Run node.js by executing the following command from the imdb-frontend directory:
 
 node app.js
 
 and login using the following credentials:
 
- user: Tim
 
- password: secret
