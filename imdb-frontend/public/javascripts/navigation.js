$(document).ready(function() {

    //console.log("DOCUMENT IS READY!");

    var viewsWrapper = $(".views-wrapper");
    var loginButton = "#login-button";
    var logoutButton = "#logout-button";
    var searchButton = "#search-button";
    var searchResultsContainer = ".results";
    var singleMovieContainer = ".single-movie";
    var rentButton = "#rent-button";
    var menu = '.menu';

    /**
     * View Navigation: Main Functions
     **/

    $("ul li.rentals").click(function() {
        $.get('/rentals', { internal: true }, function(data) {
            viewsWrapper.html(data);
            $(menu).find("li.rentals").addClass('active');
            $(menu).find("li.search").removeClass('active');
            history.pushState({ id: 1, name: 'rentals' }, '', '/rentals');
        });
    });

    $("ul li.search").click(function() {
        $.get('/search', { internal: true }, function(data) {
            viewsWrapper.html(data);
            $(menu).find("li.search").addClass('active');
            $(menu).find("li.rentals").removeClass('active')
            history.pushState({ id: 2, name: 'search' }, '', '/search');
        });
    });


    /**
     * View Navigation: Helper Function
     **/
    viewsWrapper.on("click", loginButton, function(e) {
        console.log("LOGIN BUTTON CLICK!");
        var loginData = { username: $("#username").val(), password: $("#password").val() };
        $.post('/login', loginData, function(data) {
            $('body').html(data);
            history.pushState({ id: 0, name: 'index' }, '', '/');
        });
        return false;
    });

    viewsWrapper.on("click", logoutButton, function(e) {
        $.post('/logout', function(data) {
            $('body').html(data);
            history.pushState({ id: 0, name: 'index' }, '', '/');
        });
        return false;
    });

    viewsWrapper.on("click", searchButton, function(e) {
        console.log("SEARCH BUTTON CLICK!");
        var searchData = { title: $("#search-box").val() };
        $.post('/search', searchData, function(data) {
            console.log(data);
            $(searchResultsContainer).html(data);
            history.pushState({ id: 3, name: 'search-results' }, '', '/search');
        });
        return false;
    });

    window.onpopstate = function(event) {  
        var content = "";
        if(event.state) {
            content = event.state.name;
        }
        if (content != "") {
            $.get('/' + content, { internal: true }, function(data) {
                viewsWrapper.html(data);
            });
        }       
    }


    /**
     * Misc
     **/
    viewsWrapper.on("click", rentButton, function(e) {
        if ($(e.target).hasClass("available")) {
            var movieData = { movieid: $(e.target).data('name') };
            console.log("RENTAL AVAILABLE!");
            //TODO: Call rental API here
            $.post('/rent', movieData, function(data) {
                $(e.target).prop('value', 'Rented');
            });
        }
        return false;
    });

});
