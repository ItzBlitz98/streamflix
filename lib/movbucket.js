(function () {

    var request = require('request'),
        chalk = require('chalk'),
        inquirer = require('inquirer'),
        spawn = require('child_process').spawn,
        main = require('./main.js');

    var count = 0;
    var player;
    exports.Initialize = start = function (custom_url, user_player) {
        player = user_player;
        initialize();
    };

    var initialize = function () {

        count = 0;

        inquirer.prompt([{
            type: "list",
            name: "section",
            message: chalk.green.bold("Select site section:"),
            choices: [
                "Movies",
                "Search",
                "Back to site selection"
            ]
        }], function (answer) {

            if (answer.section == "Movies") {
                movies();
            } else if (answer.section == "Search") {
                inquirer.prompt([{
                    type: "input",
                    name: "search",
                    message: chalk.green.bold("What film are you searching for?"),
                }], function (answer) {
                    search(answer.search);
                });
            } else if("Back to site selection"){
              main.AppInitialize();
            }

        });
    };

    var movies = function () {
        var data_content = {};
        var stream_content = [];
        var film_count = 0;
        count++;

        var url = "http://api.movbucket.com/movies.php?page=" + count;

        request(url, function (err, response, body) {

            data = JSON.parse(body);

            for (var movies in data.movies) {

                var title = data.movies[movies].title;
                var year = data.movies[movies].year;
                var imdb = data.movies[movies].imdbID;

                data_content = {
                    number: film_count,
                    title: title,
                    year: year,
                    imdb: imdb
                };

                film_count++;

                stream_content.push(data_content);

            }

            selectStream(stream_content, "movies");

        });

    };

    var search = function (search) {
        var data_content = {};
        var stream_content = [];
        var film_count = 0;
        count++;

        var url = "http://api.movbucket.com/movies.php?page=1&genre=action&search=" + search;

        request(url, function (err, response, body) {

            data = JSON.parse(body);
            if (data.total > 0) {
                for (var movies in data.movies) {

                    var title = data.movies[movies].title;
                    var year = data.movies[movies].year;
                    var imdb = data.movies[movies].imdbID;

                    data_content = {
                        number: film_count,
                        title: title,
                        year: year,
                        imdb: imdb
                    };

                    film_count++;

                    stream_content.push(data_content);

                }

                selectStream(stream_content, "search");
            } else {
                console.log(chalk.red.bold("No movies found."));
                initialize();
            }
        });

    };

    var selectStream = function (data, state) {

        var movie_object = [];

        data.forEach(function (movies) {
            movie_object.push({
                'key': movies.number,
                name: chalk.yellow(movies.title + " (" + movies.year + ")"),
                value: movies.number
            });
        });

        movie_object.push({
            'key': 'cat',
            name: chalk.cyan('back to category select'),
            value: 'cat'
        });

        if (state !== "search") {
            movie_object.push({
                'key': 'next',
                name: chalk.cyan('next page'),
                value: 'next'
            });
        }

        inquirer.prompt([{
            type: "list",
            name: "movie",
            message: chalk.green.bold("Select a movie:"),
            choices: movie_object
        }], function (answer) {
            if (answer.movie == "cat") {
                initialize();
            } else if (answer.movie !== "next") {
                fetchStreamlinks(answer.movie, data);
            } else {
                movies();
            }
        });

    };

    var fetchStreamlinks = function (number, data) {
        var data_content = {};
        var movie_object = [];
        count = 1;

        var imdb = data[number].imdb;
        var title = data[number].title;

        var url = "http://api.movbucket.com/movie.php?id=" + imdb;

        request(url, function (err, response, body) {

            data = JSON.parse(body);

            var link = data.movie.stream;

            startStream(link);

        });

    };

    var startStream = function (data) {
        argsList = [data];
        spawn(player, argsList, {
            stdio: 'inherit'
        });

    };

})();
