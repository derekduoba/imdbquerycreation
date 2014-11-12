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
    private String _update_plan_sql = "UPDATE CUSTOMER SET plid = ? WHERE uid = ?";
    private PreparedStatement _update_plan_statement;
	
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
    		
    // personal data(helpers), transactions rent and return
    //helper method customer info
    private String _customer = "select i.firstname, i.lastname from contactinfo i where i.cid = ?";
    private PreparedStatement _customer_info;
    
    private String _helper_compute_rentals = "select r.max_rentals, c.number_rented from rentalplans r, customer c where r.plid = c.plid and c.uid = ?";
    private PreparedStatement _helper_rentals;
    
    // transaction rent queries
    private String _transaction_rent_query = "select uid from rentals r where r.rid = ?";
    private PreparedStatement _transaction_rent;
	
    private String _transaction_rent_update_rentals = "insert into rentals values (?, ?)";
    private PreparedStatement _transaction_update_rentals;
	
	private String _transaction_rent_update_customer = "update customer set number_rented = ? where uid = ?";
	private PreparedStatement _transaction_update_customer;
	
	//transaction return queries
	private String _transaction_return_rental_update = "update Rentals set uid = NULL where rid = ?";
	private PreparedStatement _transaction_return_rentals;

	private String _transaction_return_customer_update = "update customer set number_rented = ? where uid = ?";
	private PreparedStatement _transaction_return_customer;
	
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
        _update_plan_statement = _customer_db.prepareStatement(_update_plan_sql);
	
        _list_movie_details_statement = _imdb.prepareStatement(_list_movie_details_sql);
        _list_movie_actors_statement = _imdb.prepareStatement(_list_movie_actors_sql, ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_UPDATABLE);
        _list_movie_directors_statement = _imdb.prepareStatement(_list_movie_directors_sql, ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_UPDATABLE);
	
	     // personal data, transactions rent and return
        //helper methods
        _customer_info = _customer_db.prepareStatement(_customer);
    	_helper_rentals = _customer_db.prepareStatement(_helper_compute_rentals);
        
    	//transaction rent
    	_transaction_rent = _customer_db.prepareStatement(_transaction_rent_query);
    	_transaction_update_rentals = _customer_db.prepareStatement(_transaction_rent_update_rentals);
    	_transaction_update_customer = _customer_db.prepareStatement(_transaction_rent_update_customer);
    	
    	//transaction return
    	_transaction_return_rentals = _customer_db.prepareStatement(_transaction_return_rental_update);
    	_transaction_return_customer = _customer_db.prepareStatement(_transaction_return_customer_update);
	
        /* . . . . . . */
    }


    /**********************************************************/
    /* suggested helper functions  */
    public int helper_compute_remaining_rentals(int cid) throws Exception {
    	int max_rentals = 0;
    	int number_rented = 0;
    	
    	_helper_rentals.clearParameters();
    	_helper_rentals.setInt(1, cid);
    	ResultSet rentals = _helper_rentals.executeQuery();
    	
    	while( rentals.next() ){ max_rentals = rentals.getInt("max_rentals"); number_rented = rentals.getInt("number_rented"); } 
        return(max_rentals-number_rented);
    }
    
    public int helper_check_rented(int cid) throws Exception{
	String rented = "Select number_rented from customer where uid = ?";
	PreparedStatement rent = _customer_db.prepareStatement(rented);
	rent.setInt(1, cid);
	ResultSet one = rent.executeQuery();
	int temp = 0;
	while(one.next()){ temp = one.getInt("number_rented"); } 
	return temp;
    }

    public String helper_compute_customer_name(int cid) throws Exception {
    	_customer_info.clearParameters();
    	_customer_info.setInt(1, cid);
    	ResultSet returned = _customer_info.executeQuery();
    	String first = "";
    	String last = "";
    	
    	while(returned.next()){ first = returned.getString("firstname"); last = returned.getString("lastname"); }
        return ( first + " " + last);
    }
    
    private int helper_who_has_this_movie(int mid) throws Exception {
    	String check = "select uid from rentals where rid = ?";
    	PreparedStatement checked = _customer_db.prepareStatement(check); 
    	checked.setInt(1, mid);
    	ResultSet re = checked.executeQuery();
    	int temp = 0;
    	while(re.next()){ temp = re.getInt("uid"); }
        return temp;
    }

    public boolean helper_check_plan(int plan_id) throws Exception {
        /* is plan_id a valid plan id ?  you have to figure out */
        return true;
    }

    public boolean helper_check_movie(int mid) throws Exception {
        /* is mid a valid movie id ? you have to figure out  */
        return true;
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
    	System.out.println("Welcome back " + helper_compute_customer_name(cid) + " you have " + helper_compute_remaining_rentals(cid) + " rentals remaining.");
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

    public synchronized void transaction_choose_plan(int cid, int plid) throws Exception {
        /* updates the customer's plan to pid: UPDATE CUSTOMER SET plid = ? WHERE uid = ? */
        /* remember to enforce consistency ! */
    	_update_plan_statement.clearParameters();
        _update_plan_statement.setInt(1, plid);
        _update_plan_statement.setInt(2, cid);
        _update_plan_statement.executeUpdate();
	
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
	//lists a user's current rental: SELECT R.rid FROM RENTALS R WHERE R.uid = ?
	//list movies found: SELECT name FROM MOVIE M WHERE M.id = ?"

	_list_user_rentals_statement.clearParameters();
	_list_user_rentals_statement.setInt(1, cid);
        ResultSet cid_set = _list_user_rentals_statement.executeQuery();
	System.out.println("Your Rented Movies: ");
        while(cid_set.next()){
		_list_movies_rented_statement.clearParameters();
		_list_movies_rented_statement.setInt(1, cid_set.getInt(1));
		ResultSet mid_set = _list_movies_rented_statement.executeQuery();
		if(mid_set.next()) 
			System.out.println("\t" + mid_set.getString(1));
	}
    }
    
    public void transaction_rent(int cid, int mid) throws Exception {
        /* rend the movie mid to the customer cid */
        /* remember to enforce consistency ! */
    	
    	int number_rented = helper_compute_remaining_rentals(cid);
    	String status = "";
    	
    	//for check if rental is free
    	_transaction_rent.clearParameters();
    	_transaction_rent.setInt(1, mid);
    	ResultSet open = _transaction_rent.executeQuery();
    	while(open.next()){
    		status = open.getString("uid");
    	}

    	//checks to see if allowed more rental && movie is free
    	if(( number_rented != 0 ) && (status==null || status=="")){

    		//performs update for rentals table
    		_transaction_update_rentals.clearParameters();
    		_transaction_update_rentals.setInt(1, mid);
    		_transaction_update_rentals.setInt(2, cid);
    		_transaction_update_rentals.executeUpdate();
    
    		int temp = helper_check_rented(cid) + 1;
    		
    		//performs update for customer table
    		number_rented = number_rented++;
    		_transaction_update_customer.clearParameters();
    		_transaction_update_customer.setInt(1, temp);
    		_transaction_update_customer.setInt(2, cid);
    		_transaction_update_customer.executeUpdate();
    		
    	}
    	else if(helper_who_has_this_movie(mid)==cid){ System.out.println("You are currently renting this movie!"); }
    	else if(number_rented==0){ System.out.println("You have exceeded max rentals, please return a movie."); }
    	else { System.out.println("I'm sorry, the movie has been rented out by another customer. Please try again later."); }
    }

    public void transaction_return(int cid, int mid) throws Exception {
        /* return the movie mid by the customer cid */
    	
    	//checks to see if customer actually rented the movie
    	if( (helper_who_has_this_movie(mid) == cid) ){
    		
    		_transaction_return_rentals.clearParameters();
    		_transaction_return_rentals.setInt(1, mid);
    		_transaction_return_rentals.executeUpdate();
    		
    		int temp = helper_check_rented(cid) - 1;
    		
    		_transaction_return_customer.clearParameters();
    		_transaction_return_customer.setInt(1, temp);
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
    	_list_movie_details_statement.setString(1, '%' + movie_title + '%');
    	_list_movie_actors_statement.setString(1, '%' + movie_title + '%');
    	_list_movie_directors_statement.setString(1, '%' + movie_title + '%');
    	
    	ResultSet movie_titles = _list_movie_details_statement.executeQuery();
    	ResultSet actor_names = _list_movie_actors_statement.executeQuery();
    	ResultSet movie_directors = _list_movie_directors_statement.executeQuery();
    	
    	while (movie_titles.next()) {
    		int currentID = movie_titles.getInt(1);
    		
    		System.out.println("ID: " + movie_titles.getInt(1) + " NAME: " + movie_titles.getString(2) + " YEAR: " + movie_titles.getString(3));
    		
    		while (movie_directors.next()) {
    			if (currentID == movie_directors.getInt(1)) {
    				System.out.println("DIRECTOR: " + movie_directors.getString(2) + " " + movie_directors.getString(3));
    			}
    		}
    		movie_directors.first();
    		
    		System.out.println("ACTOR(S):");
    		while (actor_names.next()) {
    			if (currentID == actor_names.getInt(1)) {
    				System.out.println("\t\t" + actor_names.getString(2) + " " + actor_names.getString(3));
    			}
    		}
    		actor_names.first();
    		
    		System.out.println();
    		
    		int mid = movie_titles.getInt(1);
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
    		
    		System.out.println();
    	}
    }

}
