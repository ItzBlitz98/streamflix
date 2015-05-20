(function () {

    var request = require('request'),
        chalk = require('chalk'),
        inquirer = require("inquirer"),
        spawn = require('child_process').spawn;

    var count = 0;
    var player;
    exports.yifytvInitialize = start = function (custom_url, user_player) {
        player = user_player;
        //popular();

        inquirer.prompt([{
            type: "list",
            name: "section",
            message: chalk.green.bold("Select site section:"),
            choices: [
                "New Releases",
                "Featured",
                "Most Popular",
                "Last Added",
                "Search"
            ]
        }], function (answer) {

            if (answer.section == "New Releases") {
                new_releases();
            } else if (answer.section == "Featured") {
                featured();
            } else if (answer.section == "Most Popular") {
                popular();
            } else if (answer.section == "Last Added") {
                releases();
            } else if (answer.section == "Search") {
                console.log("Search");
            }

        });

    };

    var initialize = function () {

    };


    var featured = function () {

        count++;

        var data_content = {};
        var stream_content = [];
        var film_count = 0;

        var search_url = "http://yify.tv/?ajaxlist&get_fea&num=" + count;

        request(search_url, function (err, response, body) {
            if (!err && response.statusCode === 200) {
                data = JSON.parse(body);

                for (var movies in data.posts) {

                    var title = data.posts[movies].title;
                    var year = data.posts[movies].year;
                    var link = data.posts[movies].link;

                    data_content = {
                        number: film_count,
                        title: title,
                        year: year,
                        link: link
                    };

                    film_count++;

                    stream_content.push(data_content);

                }

                selectStream(stream_content);

            }
        });

    };

    var new_releases = function () {

        count++;

        var data_content = {};
        var stream_content = [];
        var film_count = 0;

        var search_url = "http://yify.tv/?ajaxlist&get_rel&num=" + count;

        request(search_url, function (err, response, body) {
            if (!err && response.statusCode === 200) {
                data = JSON.parse(body);

                for (var movies in data.posts) {

                    var title = data.posts[movies].title;
                    var year = data.posts[movies].year;
                    var link = data.posts[movies].link;

                    data_content = {
                        number: film_count,
                        title: title,
                        year: year,
                        link: link
                    };

                    film_count++;

                    stream_content.push(data_content);

                }

                selectStream(stream_content);

            }
        });

    };


    var releases = function () {

        count++;

        var data_content = {};
        var stream_content = [];
        var film_count = 0;

        var search_url = "http://yify.tv/?ajaxlist&get_last&num=" + count;

        request(search_url, function (err, response, body) {
            if (!err && response.statusCode === 200) {
                data = JSON.parse(body);

                for (var movies in data.posts) {

                    var title = data.posts[movies].title;
                    var year = data.posts[movies].year;
                    var link = data.posts[movies].link;

                    data_content = {
                        number: film_count,
                        title: title,
                        year: year,
                        link: link
                    };

                    film_count++;

                    stream_content.push(data_content);

                }

                selectStream(stream_content);

            }
        });

    };

    var search = function () {

    };


    var popular = function () {

        count++;

        var data_content = {};
        var stream_content = [];
        var film_count = 0;

        var search_url = "http://yify.tv/?ajaxlist&get_pop&num=" + count;

        request(search_url, function (err, response, body) {
            if (!err && response.statusCode === 200) {
                data = JSON.parse(body);

                for (var movies in data.posts) {

                    var title = data.posts[movies].title;
                    var year = data.posts[movies].year;
                    var link = data.posts[movies].link;

                    data_content = {
                        number: film_count,
                        title: title,
                        year: year,
                        link: link
                    };

                    film_count++;

                    stream_content.push(data_content);

                }

                selectStream(stream_content);

            }
        });

    };

    var selectStream = function (data) {

        var movie_object = [];

        data.forEach(function (movies) {
            movie_object.push({
                'key': movies.number,
                name: chalk.yellow(movies.title + " (" + movies.year + ")"),
                value: movies.number
            });
        });

        movie_object.push({
            'key': 'next',
            name: chalk.cyan('next page'),
            value: 'next'
        });

        inquirer.prompt([{
            type: "list",
            name: "movie",
            message: chalk.green.bold("Select a movie:"),
            choices: movie_object
        }], function (answer) {
            if (answer.movie !== "next") {
                fetchStreamlinks(answer.movie, data);
            } else {
              //
              //
              //fix this shit
              //
              //
                popular();
            }
        });

    };

    var fetchStreamlinks = function (number, data) {
        var link = data[number].link;
        var title = data[number].title;
        var year = data[number].year;

        request(link, function (err, response, body) {
            if (!err && response.statusCode === 200) {
                var linkID = body.match(/\?pic=(.+)\&/i);
                var string = "&" + linkID[0].substring(1);
                string = string.split('&vb=')[0].split('&&&id=')[0];
                var splitid = string.split('&pic=');

                selectStreamLink(splitid);

            }
        });

    };

    var selectStreamLink = function (data) {
        delete data[0];
        var movie_object = [];
        count = 1;

        data.forEach(function (s) {
            movie_object.push({
                'key': s,
                name: chalk.yellow("Link " + count),
                value: s
            });
            count++;
        });

        inquirer.prompt([{
            type: "list",
            name: "movie",
            message: chalk.green.bold("Select a stream:"),
            choices: movie_object
        }], function (answer) {
            startStream(answer.movie);
        });

    };


    var startStream = function (data) {
        var movie_object = [];

        request.post({
            url: 'http://yify.tv/player/pk/pk/plugins/player_p2.php',
            form: {
                fv: '17',
                url: data
            }
        }, function (err, httpResponse, body) {

            data = JSON.parse(body);

            delete data[0];

            data.forEach(function (movies) {
                movie_object.push({
                    'key': movies.url,
                    name: chalk.yellow(movies.width + "x" + movies.height),
                    value: movies.url
                });

            });

            inquirer.prompt([{
                type: "list",
                name: "movie",
                message: chalk.green.bold("Select stream quality:"),
                choices: movie_object
            }], function (answer) {
                argsList = [answer.movie];
                spawn(player, argsList, {
                    stdio: 'inherit'
                });
            });

        });

    };

})();
