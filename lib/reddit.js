(function () {

    var request = require('request'),
        chalk = require('chalk'),
        inquirer = require('inquirer'),
        cheerio = require('cheerio'),
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
    var config_obj;

    exports.Initialize = start = function (config_object) {
        site_url = config_object.yifytv;
        player = config_object.player;
        player_sub_cmd = config_object.player_sub_cmd;
        use_subtitle = config_object.subtitles;
        subtitle_language = config_object.subtitle_lang;
        download_location = config_object.download_location;
        config_obj = config_object;
        initialize();
    };

    var initialize = function () {
        count = 0;
        var subs_object = [];

        config_obj.reddit.forEach(function (subs) {
            subs_object.push({
                'key': subs,
                name: chalk.yellow(subs),
                value: subs
            });

        });

        subs_object.push({
            'key': 'site',
            name: chalk.cyan('Back to site selection'),
            value: 'site'
        });

        inquirer.prompt([{
            type: "list",
            name: "subreddit",
            message: chalk.green.bold("Select site section:"),
            choices: subs_object
        }], function (answer) {
            if (answer.subreddit == "site") {
              main.AppInitialize();
            } else {
              getStreamlink(answer.subreddit);
            }
        });

    };

    var getStreamlink = function (subreddit) {
        var data_content = {};
        var stream_content = [];
        var film_count = 0;
        count++;
        var url = "https://www.reddit.com/r/" + subreddit + "/hot.json";

        request(url, function (err, response, body) {
            if (!err && response.statusCode === 200) {

                data = JSON.parse(body);

                data.data.children.forEach(function (movies) {
                    var url = movies.data.url;
                    var title = movies.data.title;

                    var matches = url.match(/watch\?v=([a-zA-Z0-9\-_]+)/);

                    if (matches) {

                        data_content = {
                            number: film_count,
                            title: title,
                            link: url
                        };

                        film_count++;

                        stream_content.push(data_content);

                    }


                });

                selectStream(stream_content, "movies");

            } else {
                console.log(chalk.red.bold('There was a problem loading reddit'));
                main.AppInitialize();
            }
        });

    };


    var selectStream = function (data, state) {

      var movie_object = [];

        if (data['0'] !== null) {
            data.forEach(function (movies) {
                movie_object.push({
                    'key': movies.number,
                    name: chalk.yellow(movies.title),
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
                  startStream(answer.movie, data);
                }
            });
        } else {
            console.log(chalk.red.bold('There does not seem to be any youtube videos on this sub'));
            main.AppInitialize();
        }
    };


    var startStream = function (number, data) {
      var link = data[number].link;
      var title = data[number].title;

      movie_title = title;

      getSubs(link);

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
