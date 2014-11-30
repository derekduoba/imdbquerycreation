$(document).ready(function() {

    //console.log("DOCUMENT IS READY!");

    var viewsWrapper = $(".views-wrapper");
    var loginButton = "#login-button";
    var logoutButton = "#logout-button";

    /**
     * View Navigation Functions
     **/

    $("ul li.rentals").click(function() {
        $.get('/rentals', { internal: true }, function(data) {
            viewsWrapper.html(data);
            history.pushState({ id: 1, name: 'rentals' }, '', '/rentals');
        });
    });

    $("ul li.search").click(function() {
        $.get('/search', { internal: true }, function(data) {
            viewsWrapper.html(data);
            history.pushState({ id: 2, name: 'search' }, '', '/search');
        });
    });


    /**
     * Helper Function
     **/
    viewsWrapper.on("click", loginButton, function(e) {
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
});
