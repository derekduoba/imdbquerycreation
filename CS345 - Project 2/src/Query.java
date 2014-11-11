import java.util.Properties;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import java.io.FileInputStream;

/**
 * Runs queries against a back-end database
 */
public class Query {
    private static Properties configProps = new Properties();

    private static String imdbUrl;
    private static String customerUrl;

    private static String postgreSQLDriver;
    private static String postgreSQLUser;
    private static String postgreSQLPassword;

    // DB Connection
    private Connection _imdb;
    private Connection _customer_db;

    // Canned queries

    private String _search_sql = "SELECT * FROM movie WHERE LOWER(name) like LOWER(?) ORDER BY id";
    private PreparedStatement _search_statement;

    private String _director_mid_sql = "SELECT y.* "
                     + "FROM movie_directors x, directors y "
                     + "WHERE x.mid = ? and x.did = y.id";
    private PreparedStatement _director_mid_statement;

    private String _customer_login_sql = "SELECT L.lid FROM LOGIN L" 
				+ " WHERE username = ? and password = ?";
    private PreparedStatement _customer_login_statement;

    private String _begin_transaction_read_write_sql = "BEGIN TRANSACTION READ WRITE";
    private PreparedStatement _begin_transaction_read_write_statement;

    private String _commit_transaction_sql = "COMMIT TRANSACTION";
    private PreparedStatement _commit_transaction_statement;

    private String _rollback_transaction_sql = "ROLLBACK TRANSACTION";
    private PreparedStatement _rollback_transaction_statement;

    // Created queries
    //List plans
    private String _transaction_list_plans_sql = "SELECT * FROM RENTALPLANS";
    private PreparedStatement _list_plans_transaction_statement;

    //User Rentals
    private String _list_user_rentals_sql = "SELECT R.rid FROM RENTALS R WHERE R.uid = ?";
    private PreparedStatement _list_user_rentals_statement;

    private String _list_movies_rented_sql = "SELECT name FROM MOVIE M WHERE M.id = ?";
    private PreparedStatement _list_movies_rented_statement;

    //Choose Plan
    private String _update_plan_sql = "UPDATE CUSTOMERS SET plid = ? WHERE cid = ?";
    private PreparedStatement _update_plan_statement;
    
    //Personal Data queries
	private String _transaction_personal_data_query = "select i.firstname, i.lastname, c.number_rented, c.max_rentals from ContactInfo i, Customer c where i.cid = ? and c.uid = ?";
	private PreparedStatement _transaction_personal_query;
    
    // transaction rent queries
	private String _transaction_rent_query = "select r.rid, r.status, c.number_rented, c.max_rentals from Rentals r, Customer c where r.rid = ? and c.uid = ?";
	private PreparedStatement _transaction_rent;
	
	private String _transaction_rent_update_rentals = "update rentals set uid = ?, status = '?' where rid = ?";
	private PreparedStatement _transaction_update_rentals;
	
	private String _transaction_rent_update_customer = "update customer set number_rented = ? where uid = ?";
	private PreparedStatement _transaction_update_customer;
	
	//transaction return queries
	private String _transaction_return_query = "select r.uid, r.status, c.number_rented from Rentals r, Customer c where r.rid = ? and c.uid = ?";
	private PreparedStatement _transaction_return;
	
	private String _transaction_return_rental_update = "update Rentals set status = 'open' where rid = ?";
	private PreparedStatement _transaction_return_rentals;

	private String _transaction_return_customer_update = "update customer set number_rented = ? where uid = ?";
	private PreparedStatement _transaction_return_customer;
	
    // Regular Search queries
	private String _actor_mid_sql = "SELECT A.fname, A.lname "
    				 + "FROM actor A, casts C "
    				 + "WHERE C.mid = ? AND C.pid = A.id";
    private PreparedStatement _actor_mid_statement;
	
    private String _rental_mid_sql = "SELECT * "
    				 + "FROM rentals "
    				 + "WHERE rid = ?";
	private PreparedStatement _rental_mid_statement;
	
    // Fast Search queries
    
    //return only the movie information (id, title, year) for all movies matching a keyword
    private String _list_movie_details_sql = "SELECT m.id, m.name, m.year FROM movie as m WHERE LOWER(m.name) like LOWER(?) ORDER BY m.id";
    private PreparedStatement _list_movie_details_statement;
    
    // return the movie's actors
    private String _list_movie_actors_sql = "SELECT m.id, a.fname, a.lname FROM actor as a INNER JOIN casts as c ON a.id=c.pid INNER JOIN movie as m ON c.mid=m.id WHERE LOWER(m.name) like LOWER(?) ORDER BY m.id";
    private PreparedStatement _list_movie_actors_statement;
    
    // return the movie's directors
    private String _list_movie_directors_sql = "SELECT m.id, d1.fname, d1.lname FROM directors as d1 INNER JOIN movie_directors as d2 ON d1.id=d2.did INNER JOIN movie as m ON m.id=d2.mid WHERE LOWER(m.name) like LOWER(?) ORDER BY m.id";
    private PreparedStatement _list_movie_directors_statement;
    		
    public Query() {
    }

    /**********************************************************/
    /* Connections to postgres databases */

    public void openConnection() throws Exception {
        configProps.load(new FileInputStream("dbconn.config"));
        
        
        imdbUrl        = configProps.getProperty("imdbUrl");
        customerUrl    = configProps.getProperty("customerUrl");
        postgreSQLDriver   = configProps.getProperty("postgreSQLDriver");
        postgreSQLUser     = configProps.getProperty("postgreSQLUser");
        postgreSQLPassword = configProps.getProperty("postgreSQLPassword");


        /* load jdbc drivers */
        Class.forName(postgreSQLDriver).newInstance();

        /* open connections to TWO databases: imdb and the customer database */
        _imdb = DriverManager.getConnection(imdbUrl, // database
                postgreSQLUser, // user
                postgreSQLPassword); // password

        _customer_db = DriverManager.getConnection(customerUrl, // database
                postgreSQLUser, // user
                postgreSQLPassword); // password
    }

    public void closeConnection() throws Exception {
        _imdb.close();
        _customer_db.close();
    }

    /**********************************************************/
    /* prepare all the SQL statements in this method.
      "preparing" a statement is almost like compiling it.  Note
       that the parameters (with ?) are still not filled in */

    public void prepareStatements() throws Exception {

        _search_statement = _imdb.prepareStatement(_search_sql);
        _director_mid_statement = _imdb.prepareStatement(_director_mid_sql);

        /* uncomment after you create your customers database */
        
        _customer_login_statement = _customer_db.prepareStatement(_customer_login_sql);
        _begin_transaction_read_write_statement = _customer_db.prepareStatement(_begin_transaction_read_write_sql);
        _commit_transaction_statement = _customer_db.prepareStatement(_commit_transaction_sql);
        _rollback_transaction_statement = _customer_db.prepareStatement(_rollback_transaction_sql);
         

        /* add here more prepare statements for all the other queries you need */
	//regular search queries
		_actor_mid_statement = _imdb.prepareStatement(_actor_mid_sql);
        _rental_mid_statement = _customer_db.prepareStatement(_rental_mid_sql);
		
	//list rental plans
        _list_plans_transaction_statement = _customer_db.prepareStatement(_transaction_list_plans_sql);

	//list movies a user rented
        _list_user_rentals_statement = _customer_db.prepareStatement(_list_user_rentals_sql);
	_list_movies_rented_statement = _imdb.prepareStatement(_list_movies_rented_sql);

	//User chooses a rental plan
        _choose_plan_statement = _customer_db.prepareStatement(_choose_plan_sql);
	
        _list_movie_details_statement = _imdb.prepareStatement(_list_movie_details_sql);
        _list_movie_actors_statement = _imdb.prepareStatement(_list_movie_actors_sql, ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_UPDATABLE);
        _list_movie_directors_statement = _imdb.prepareStatement(_list_movie_directors_sql, ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_UPDATABLE);

        /* . . . . . . */
    }


    /**********************************************************/
    /* suggested helper functions  */

    public int helper_compute_remaining_rentals(int cid) throws Exception {
        /* how many movies can she/he still rent ? */
        /* you have to compute and return the difference between the customer's plan
           and the count of oustanding rentals */
        return (99);
    }

    public String helper_compute_customer_name(int cid) throws Exception {
        /* you find  the first + last name of the current customer */
        return ("JoeFirstName" + " " + "JoeLastName");

    }

    public boolean helper_check_plan(int plan_id) throws Exception {
        /* is plan_id a valid plan id ?  you have to figure out */
        return true;
    }

    public boolean helper_check_movie(int mid) throws Exception {
        /* is mid a valid movie id ? you have to figure out  */
        return true;
    }

    private int helper_who_has_this_movie(int mid) throws Exception {
        /* find the customer id (cid) of whoever currently rents the movie mid; return -1 if none */
        return (77);
    }

    /**********************************************************/
    /* login transaction: invoked only once, when the app is started  */
    public int transaction_login(String name, String password) throws Exception {
        /* authenticates the user, and returns the user id, or -1 if authentication fails */
    
	/* uncomment after you create your customers database */
        int cid;

        _customer_login_statement.clearParameters();
        _customer_login_statement.setString(1,name);
        _customer_login_statement.setString(2,password);
        ResultSet cid_set = _customer_login_statement.executeQuery();
        if (cid_set.next()) cid = cid_set.getInt(1);
        else cid = -1;
        return(cid);

    }


    public void transaction_personal_data(int cid) throws Exception {
        // println the customer's personal data: name, and plan number
    	/*
    	//clears and updates prepared statement
    	_transaction_personal_query.clearParameters();
    	_transaction_personal_query.setInt(1, cid);
    	_transaction_personal_query.setInt(2, cid);
    	ResultSet _personal_data = _transaction_personal_query.executeQuery();
    	
    	while(_personal_data.next()){
    		System.out.println("Member: " + _personal_data.getString("firstname") + " " + _personal_data.getString("lastname") + " Rentals Left: "
    							+ (_personal_data.getInt("max_rentals") - _personal_data.getInt("number_rented")));
    	} 
    	 */
    }


    /**********************************************************/
    /* main functions in this project: */

    public void transaction_search(int cid, String movie_title)
            throws Exception {
        /* searches for movies with matching titles: SELECT * FROM movie WHERE name LIKE movie_title */
        /* prints the movies, directors, actors, and the availability status:
           AVAILABLE, or UNAVAILABLE, or YOU CURRENTLY RENT IT */

        /* set the first (and single) '?' parameter */
        _search_statement.clearParameters();
        _search_statement.setString(1, '%' + movie_title + '%');

        ResultSet movie_set = _search_statement.executeQuery();
        while (movie_set.next()) {
            int mid = movie_set.getInt(1);
            System.out.println("ID: " + mid + " NAME: "
                    + movie_set.getString(2) + " YEAR: "
                    + movie_set.getString(3));
            /* do a dependent join with directors */
            _director_mid_statement.clearParameters();
            _director_mid_statement.setInt(1, mid);
            ResultSet director_set = _director_mid_statement.executeQuery();
            while (director_set.next()) {
                System.out.println("\t\tDirector: " + director_set.getString(3)
                        + " " + director_set.getString(2));
            }
            director_set.close();
            
            /* now you need to retrieve the actors, in the same manner */
            _actor_mid_statement.clearParameters();
            _actor_mid_statement.setInt(1, mid);
            ResultSet actor_set = _actor_mid_statement.executeQuery();
            if (actor_set.next()) // This if makes sure "Actors" is printed only if there are one or more
            {
            	System.out.println("\t\tActors:"); 
            	System.out.println("\t\t\t" + actor_set.getString(1) + " " + actor_set.getString(2));}
            while (actor_set.next()){
            	System.out.println("\t\t\t" + actor_set.getString(1) + " " + actor_set.getString(2));
            }
            actor_set.close();
            
            /* then you have to find the status: of "AVAILABLE" "YOU HAVE IT", "UNAVAILABLE" */
            _rental_mid_statement.clearParameters();
            _rental_mid_statement.setInt(1, mid);
            ResultSet rental_set = _rental_mid_statement.executeQuery();
            if(rental_set.next()){
            	int rental_uid = rental_set.getInt(2);
            	
            	if (rental_uid == cid) {
            		System.out.println("\t\tStatus: YOU HAVE IT");
            	} else {
            		System.out.println("\t\tStatus: UNAVAILABLE");
            	}
            } else {
            	System.out.println("\t\tStatus: AVAILABLE");
            }
        }
        System.out.println();
    }

    public synchronized void transaction_update_plan(int cid, int plid) throws Exception {
        /* updates the customer's plan to pid: UPDATE customers SET plid = pid */
        /* remember to enforce consistency ! */
	_choose_plan_statement.clearParameters();
        _choose_plan_statement.setInt(1, plid);
        _choose_plan_statement.setInt(2, cid);
	_choose_plan_statement.executeQuery();
	
    }

    public void transaction_list_plans() throws Exception {
        /* println all available plans: SELECT * FROM plan */

    	_list_plans_transaction_statement.clearParameters();
        ResultSet cid_set = _list_plans_transaction_statement.executeQuery();
        while(cid_set.next()){
		System.out.println("Rental Plan " + cid_set.getInt(1) + ": " + cid_set.getString(2));
        }

    }
    
    public void transaction_list_user_rentals(int cid) throws Exception {
        /* println all movies rented by the current user*/

	_list_user_rentals_statement.clearParameters();
	_list_user_rentals_statement.setInt(1, cid);
        ResultSet cid_set = _list_user_rentals_statement.executeQuery();
	System.out.println("Your Rented Movies: "
        while(cid_set.next()){
		_list_movies_rented_statement.clearParameters();
		_list_movies_rented_statement.setInt(1, cid_set.getInt());
		ResultSet mid_set = _list_movies_rented_statement.executeQuery();
		System.out.println("\t" + mid_set.getString(1));
	}

    }

    public void transaction_rent(int cid, int mid) throws Exception {
        /* rend the movie mid to the customer cid */
        /* remember to enforce consistency ! */
    	
    	//clears and updates query search parameters
    	_transaction_rent.clearParameters();
    	_transaction_rent.setInt(1, mid);
    	_transaction_rent.setInt(2, cid);
    	
    	ResultSet rent_set = _transaction_rent.executeQuery();
    	
    	//placement variables
    	int number_rented = 0;
    	int max_rentals = 0;
    	String status = null;
    	
    	//update variables
    	while(rent_set.next()){
    		status = rent_set.getString("status");
    		number_rented = rent_set.getInt("number_rented");
    		max_rentals = rent_set.getInt("max_rentals");
    	}
    	
    	//probably need to make check for errors if queries doesn't update variables right.
    	
    	//checks to see if allowed more rental && movie is free
    	if( status.equals("open") && (number_rented < max_rentals) ){
    		
    		//performs update for rentals table
    		_transaction_update_rentals.clearParameters();
    		_transaction_update_rentals.setInt(1, cid);
    		_transaction_update_rentals.setString(2, "closed");
    		_transaction_update_rentals.setInt(1, mid);
    		_transaction_update_rentals.executeUpdate();
    		
    		//performs update for customer table
    		number_rented = number_rented++;
    		_transaction_update_customer.clearParameters();
    		_transaction_update_customer.setInt(1, number_rented);
    		_transaction_update_customer.setInt(2, cid);
    		_transaction_update_customer.executeUpdate();
    	}
    	else { System.out.println("Not allowed to rent, may have exceeded max or movie unavailable."); }
    }

    public void transaction_return(int cid, int mid) throws Exception {
        /* return the movie mid by the customer cid */
    	
    	//clears and updates new parameters
    	_transaction_return.clearParameters();
    	_transaction_return.setInt(1, mid);
    	_transaction_return.setInt(2, cid);
    	ResultSet _return_query = _transaction_return.executeQuery();
    	
    	//placeholders
    	int past_customer = 0;
    	int number_rented = 0;
    	String status = "";
    	
    	//update variables
    	while(_return_query.next()){
    		past_customer = _return_query.getInt("uid");
    		number_rented = _return_query.getInt("number_rented");
    		status = _return_query.getString("status");
    	}
    	
    	//checks to see if customer actually rented the movie
    	if( (past_customer == cid) && status.equals("closed")){
    		
    		_transaction_return_rentals.clearParameters();
    		_transaction_return_rentals.setInt(1, mid);
    		_transaction_return_rentals.executeUpdate();
    		
    		number_rented = number_rented--;
    		_transaction_return_customer.clearParameters();
    		_transaction_return_customer.setInt(1, number_rented);
    		_transaction_return_customer.setInt(2, cid);
    		_transaction_return_customer.executeUpdate();
    	}
    	else{ System.out.println("You did not rent this movie."); }
    }

    public void transaction_fast_search(int cid, String movie_title)
            throws Exception {
        /* like transaction_search, but uses joins instead of independent joins
           Needs to run three SQL queries: (a) movies, (b) movies join directors, (c) movies join actors
           Answers are sorted by mid.
           Then merge-joins the three answer sets */
    	_list_movie_details_statement.setString(1, movie_title);
    	_list_movie_actors_statement.setString(1, movie_title);
    	_list_movie_directors_statement.setString(1, movie_title);
    	
    	ResultSet movie_titles = _list_movie_details_statement.executeQuery();
    	ResultSet actor_names = _list_movie_actors_statement.executeQuery();
    	ResultSet movie_directors = _list_movie_directors_statement.executeQuery();
    	
    	while (movie_titles.next()) {
    		int currentID = movie_titles.getInt(1);
    		
    		System.out.println("Movie name: " + movie_titles.getInt(1) + " " + movie_titles.getString(2));
    		System.out.println("Actor(s):");
    		while (actor_names.next()) {
    			if (currentID == actor_names.getInt(1)) {
    				System.out.println(actor_names.getString(2) + " " + actor_names.getString(3));
    			}
    		}
    		actor_names.first();
    		
    		while (movie_directors.next()) {
    			if (currentID == movie_directors.getInt(1)) {
    				System.out.println("Director:" + movie_directors.getString(2) + " " + movie_directors.getString(3));
    			}
    		}
    		movie_directors.first();
    		
    		System.out.println();
    	}
    }

}
