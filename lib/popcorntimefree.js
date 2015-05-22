(function () {

    var request = require('request'),
        chalk = require('chalk'),
        inquirer = require('inquirer'),
        spawn = require('child_process').spawn,
        main = require('./main.js'),
        subtitles = require('./subtitles.js'),
        download = require('./download.js');

    var count = 0;
    var player;
    var player_sub_cmd;
    var site_url;
    var movie_title;
    var subtitle_language;
    var use_subtitle;
    var download_location;

    exports.Initialize = start = function (config_object) {
        site_url = config_object.popcorntimefree;
        player = config_object.player;
        player_sub_cmd = config_object.player_sub_cmd;
        use_subtitle = config_object.subtitles;
        subtitle_language = config_object.subtitle_lang;
        download_location = config_object.download_location;
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
            } else if ("Back to site selection") {
                main.AppInitialize();
            }

        });
    };

    var movies = function () {
        var data_content = {};
        var stream_content = [];
        var film_count = 0;
        count++;

        var url = site_url + "/ajax.php?action=movies&query=";

        request(url, function (err, response, body) {

            data = JSON.parse(body);

            data.forEach(function (movies) {

                data_content = {
                    number: film_count,
                    title: movies.title,
                    year: movies.year,
                    link: movies.stream
                };

                film_count++;

                stream_content.push(data_content);

            });

            selectStream(stream_content, "movies");

        });

    };

    var search = function (search) {
        var data_content = {};
        var stream_content = [];
        var film_count = 0;
        count++;

        var url = site_url + "/ajax.php?action=movies&query=" + search;

        request(url, function (err, response, body) {


            data = JSON.parse(body);

            data.forEach(function (movies) {

                data_content = {
                    number: film_count,
                    title: movies.title,
                    year: movies.year,
                    link: movies.stream
                };

                film_count++;

                stream_content.push(data_content);

            });

            selectStream(stream_content, "movies");



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
            }
        });

    };

    var fetchStreamlinks = function (number, data) {
        var link = data[number].link;
        var year = data[number].year;
        var title = data[number].title;

        movie_title = title + " " + year;

        getSubs(link);

    };

    var sod = function (movie) {

        download.fetch(movie, movie_title, download_location);

    };


    var getSubs = function (movie) {
        if (use_subtitle) {

            subtitles.fetchSub(subtitle_language, movie_title).then(function (data) {

                if (data !== false) {
                    subtitles = data;
                    spawnPlayer(movie, subtitles);
                } else {
                    spawnPlayer(movie);
                }

            });
        } else {
            spawnPlayer(movie);
        }
    };


    var spawnPlayer = function (movie, subtitles) {

        if (subtitles) {
            argsList = [movie, player_sub_cmd + subtitles];
        } else {
            argsList = [movie];
        }

        spawn(player, argsList, {
            stdio: 'inherit'
        });

    };

})();
