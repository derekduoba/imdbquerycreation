/**
 * Global Behaviors
 **/

OMDBAPIURL = 'http://www.omdbapi.com/?';

function queryData() {
    this.longQuery = undefined;
    this.shortQuery = undefined;
    this.movies = {};

    this.containsMovie = function(movie) {
        if (movie.imdbID in this.movies) {
            return true;
        }
        return false;
    }

    this.addMovie = function(movie) {
        if (!(this.containsMovie(movie))) {
            this.movies[movie.imdbID] = movie;
        }
    }

    this.removeMovie = function(movie) {
        if (this.containsMovie(movie)) {
            delete this.movies[movie.imdbID];
        }
    }

}

function insertMovieSubmission(movie, movieSelectionsContainer, currentQueryData) {
    var movieHTML = "<div class=\'col-lg-12 text-center v-center btn-lg movie\' data-movie-id=\'" + movie.imdbID + "\'>" + 
                        movie.Title + " (" + movie.Year + ")" + 
                    "</div><br>"; 
    if (movieSelectionsContainer.find('.glyphicon').length !== 0) {
        movieSelectionsContainer.html(movieHTML);
    } else {
         movieSelectionsContainer.append(movieHTML);
    }
    currentQueryData.addMovie(movie);
}

function removeMovieSubmission(movie, movieSelectionsContainer, currentQueryData, currentResultRow) {
    movieSelectionsContainer.find("[data-movie-id='" + movie.imdbID  + "']").next("br").remove();
    movieSelectionsContainer.find("[data-movie-id='" + movie.imdbID  + "']").remove();
    currentQueryData.removeMovie(movie);
    if (currentResultRow !== undefined) {
        currentResultRow.find(".select").removeClass('selected');        
    }
}

function getMovies(data, retrievedMoviesContainer, movieMap, currentQueryData) {
    var jsonResults = data;
    for (var member in movieMap) {
        delete movieMap[member];

    }
    if (jsonResults.Search !== undefined) {
        var resultsTable = "<table class='table table-hover table-striped' id='movie-data'>" +
                                "<thead>" +
                                    "<tr>" +
                                        "<th>Name</th>" +
                                        "<th>Year</th>" +
                                        "<th style='text-align:center'>Selected</th>" +
                                    "</tr>" +
                                "</thead>" +
                                "<tbody>";
        var i;
        for (i = 0; i < Object.keys(jsonResults.Search).length; i++) {
            var selectClass;
            if (currentQueryData.containsMovie(jsonResults.Search[i])) {
                selectClass = 'select selected';
            } else {
                selectClass = 'select';   
            }
            movieMap[jsonResults.Search[i].imdbID] = jsonResults.Search[i];
            resultsTable += "<tr data-movie-id='" + jsonResults.Search[i].imdbID + "'>" +
                                "<td>" + jsonResults.Search[i].Title + "</td>" +
                                "<td>" + jsonResults.Search[i].Year + "</td>" +
                                "<td class='" + selectClass + "'>" +
                                    "<span class='glyphicon glyphicon-ok-circle'></span>" +
                                "</td>" +
                            "</tr>"
        }
        resultsTable += "</tbody></table>";
        retrievedMoviesContainer.html(resultsTable);
        $(retrievedMoviesContainer).blur();            
    } else {
        retrievedMoviesContainer.html("<p class='lead'>No movies found. Care to try again?</p>");
    }
}

function isEmpty(str) {
    return (str === undefined || str.length === 0);
}

function isObjectEmpty(obj) {
    for(var property in obj) {
        if (obj.hasOwnProperty(property)) {
            return false;
        }
    }
    return true;
}


$(document).ready(function() {
    var currentQueryData = new queryData();
    var movieMap = {};
    var longQueryBox = $('#long-query');
    var longQueryButton = $('#long-query-button');
    var longQueryMessage = $('.long-query-message');
    var shortQueryBox = $('#short-query');
    var shortQueryButton = $('#short-query-button');
    var shortQueryMessage = $('.short-query-message');
    var titleSearchBox = $('#movie-title'); 
    var yearSearchBox = $('#movie-year');
    var searchButton = $('#search-button');
    var retrievedMoviesContainer = $('.retrieved-movie-container');
    var movieSelectionsContainer = $('.movie-selections-container');  
    var submitButton = $('#submit-button');
    var submitMessage = $('.submit-message');

    $(window).keypress(function(event){
        if(event.keyCode == 13) {
            //event.preventDefault();
            
            //console.log(event.target.id);
            //console.log(longQueryBox.attr("id"));
            
            if (event.target.id === longQueryBox.attr('id')) {
                $(longQueryButton).click();
            } else if (event.target.id === shortQueryBox.attr('id')) {
                $(shortQueryButton).click();
            } else if (event.target.id === titleSearchBox.attr('id') || event.target.id === yearSearchBox.attr('id')) {
                $(searchButton).click();
            } else {
                event.preventDefault();
            }
            return false;
        }
    }); 

    
    $(longQueryButton).click(function(event) {
        var longQuery = longQueryBox.val();
        if (longQueryBox.val().length !== 0 && longQueryBox.val().trim())  {
            currentQueryData.longQuery = longQueryBox.val();
            longQueryMessage.find('p').html("Well done. Now, go to the next section.");
            $(longQueryBox).blur();
        } else {
            
            //console.log(longQueryBox.val().length === 0);
            //console.log(longQueryBox.val());
            
            longQueryMessage.find('p').html("Enter a long-form query before clicking \"OK.\"");   
        }
    });


    $(shortQueryButton).click(function(event) {
        var shortQuery = shortQueryBox.val();
        if (shortQueryBox.val().length !== 0 && shortQueryBox.val().trim())  {
            currentQueryData.shortQuery = shortQueryBox.val();
            shortQueryMessage.find('p').html("You're awesome. On to the next section.");
            $(shortQueryBox).blur();
        } else {
            shortQueryMessage.find('p').html("Enter a short-form query before clicking \"OK.\"");   
        }
    });

    $(searchButton).click(function(event) {
        if (titleSearchBox.val().length !== 0 && titleSearchBox.val().trim())  {
            var currentURL = OMDBAPIURL + 's=' + encodeURIComponent(titleSearchBox.val())
            if (yearSearchBox.val().length !== 0 && yearSearchBox.val().trim())  {
                currentURL += '&y=' + yearSearchBox.val(); 
            }
            retrievedMoviesContainer.html('<img src="../images/preloader.gif">');
            $.ajax({
                async: true,
                url: currentURL,
                timeout: 8000,
            }).fail(function(data, textStatus) {
                    retrievedMoviesContainer.html("<p class='lead'>The movie database appears to be down. Please try again later.</p>");
            }).success(function(data) {
                    getMovies(data, retrievedMoviesContainer, movieMap, currentQueryData);
            });
            $(titleSearchBox).blur();
            $(yearSearchBox).blur();
        } else {
            retrievedMoviesContainer.html("<p class='lead'>Enter a movie title before clicking \"SEARCH\"</p>");   
        } 
    });

    
    $(retrievedMoviesContainer).on('click', 'td', function(event) {
        var currentRow = $(this).parent();
        var currentMovie = movieMap[currentRow.data('movie-id')];
        if (!currentRow.children('.select').hasClass('selected')) {
            currentRow.children('.select').addClass('selected');
            insertMovieSubmission(currentMovie, movieSelectionsContainer, currentQueryData);
        } else {
            currentRow.children('.select').removeClass('selected');
            removeMovieSubmission(currentMovie, movieSelectionsContainer, currentQueryData)
        }
    });

    $(movieSelectionsContainer).on('click', '.movie', function(event) {
        var currentMovieBox = $(this);
        var currentMovie = currentQueryData.movies[currentMovieBox.data('movie-id')];
        var currentResultRow = $(retrievedMoviesContainer).find("[data-movie-id='" + currentMovieBox.data('movie-id') + "']");
        removeMovieSubmission(currentMovie, movieSelectionsContainer, currentQueryData, currentResultRow);
    }); 


    $(submitButton).click(function(event) {
        if (isEmpty(currentQueryData.shortQuery)) {
            submitMessage.html("<p class='lead'>Looks like you missed the short query. Go ahead and fix that.</p>");
        } else if (isEmpty(currentQueryData.longQuery)) {
            submitMessage.html("<p class='lead'>Looks like you missed the long query. Go and add one.</p>");
        } else if (isObjectEmpty(currentQueryData.movies)) {
            submitMessage.html("<p class='lead'>Please choose some movies that answer your queries.</p>");
        } else {
   
            console.log(currentQueryData.shortQuery);
 
            var queryDataPackage = {
                "shortquery": currentQueryData.shortQuery,
                "longquery": currentQueryData.longQuery,
                "movies": currentQueryData.movies
            }
            $.ajax({
                async: true,
                url: '/api/sendquerydata',
                data: $.param(queryDataPackage),
                method: 'POST',
                timeout: 5000,
            }).fail(function(data, textStatus) {
                submitMessage.html("<p class='lead'>The submission database appears to be down. Please try again later.</p>");
            }).success(function(data) {
                $(submitButton).html("THANKS");
                $(submitButton).attr("disabled", "disabled");
                console.log(data);
                submitMessage.html(data);
            });
        }
    });

});
