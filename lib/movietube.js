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
    var token;
    var player_arg_cmd;

    exports.Initialize = start = function (config_object) {
        site_url = config_object.movietube;
        player = config_object.player;
        player_sub_cmd = config_object.player_sub_cmd;
        use_subtitle = config_object.subtitles;
        player_arg_cmd = config_object.player_arg_cmd;
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
                "In Cinema",
                "What's New",
                "HD",
                "Search",
                "Back to site selection"
            ]
        }], function (answer) {

            if (answer.section == "In Cinema") {
                cinema();
            } else if (answer.section == "What's New") {
                new_release();
            } else if (answer.section == "HD") {
                hd();
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


    var cinema = function () {

        count++;

        var data_content = {};
        var stream_content = [];
        var film_count = 0;

        var url = site_url + "/index.php";
        var formData;

        if (count === 1) {
            formData = {
                c: 'song',
                a: 'retrieve',
                p: '{"Page":"' + count + '","NextToken":"","Genere":"","Year":"","VideoSource":"","Sortby":"Score"}'
            };
        } else {
            formData = {
                c: 'song',
                a: 'retrieve',
                p: '{"Page":"' + count + '","NextToken":"' + token.split(' ').join('').split('\n').join('') + '","Genere":"","Year":"","VideoSource":"","Sortby":"Score"}'
            };
        }

        request.post({
            url: url,
            formData: formData
        }, function (err, response, body) {

            if (!err && response.statusCode === 200) {

                token = body.substring(0, body.indexOf('<tr')).replace(/ /g, '');

                $ = cheerio.load(body);

                $('tr').each(function (index, movies) {

                    var find_link = $(movies).find('.dtl h1 a');

                    var link = $(find_link).attr('href');
                    var title = $(find_link).text();

                    data_content = {
                        number: film_count,
                        title: title,
                        link: link
                    };

                    film_count++;

                    stream_content.push(data_content);

                });

                selectStream(stream_content, "cinema");

            } else {
                console.log(chalk.red.bold('There was a problem loading movietube'));
                main.AppInitialize();
            }

        });

    };

    var new_release = function () {
        count++;

        var data_content = {};
        var stream_content = [];
        var film_count = 0;
        var formData;
        var url = site_url + "/index.php";

        if (count === 1) {
            formData = {
                c: 'song',
                a: 'retrieve',
                p: '{"Page":"' + count + '","NextToken":"","Genere":"","Year":"","VideoSource":"","Sortby":"ReleaseDate"}'
            };
        } else {
            formData = {
                c: 'song',
                a: 'retrieve',
                p: '{"Page":"' + count + '","NextToken":"' + token.split(' ').join('').split('\n').join('') + '","Genere":"","Year":"","VideoSource":"","Sortby":"ReleaseDate"}'
            };
        }


        request.post({
            url: url,
            formData: formData
        }, function (err, response, body) {

            if (!err && response.statusCode === 200) {
                token = body.substring(0, body.indexOf('<tr')).replace(/ /g, '');
                $ = cheerio.load(body);

                $('tr').each(function (index, movies) {

                    var find_link = $(movies).find('.dtl h1 a');

                    var link = $(find_link).attr('href');
                    var title = $(find_link).text();

                    data_content = {
                        number: film_count,
                        title: title,
                        link: link
                    };

                    film_count++;

                    stream_content.push(data_content);

                });

                selectStream(stream_content, "new_release");

            } else {
                console.log(chalk.red.bold('There was a problem loading movietube'));
                main.AppInitialize();
            }

        });


    };


    var hd = function () {
        count++;

        var data_content = {};
        var stream_content = [];
        var film_count = 0;
        var formData;

        var url = site_url + "/index.php";

        if (count === 1) {
            formData = {
                c: 'song',
                a: 'retrieve',
                p: '{"Page":"' + count + '","NextToken":"","Genere":"","Year":"","VideoSource":"720P","Sortby":"Score"}'
            };
        } else {
            formData = {
                c: 'song',
                a: 'retrieve',
                p: '{"Page":"' + count + '","NextToken":"' + token.split(' ').join('').split('\n').join('') + '","Genere":"","Year":"","VideoSource":"720P","Sortby":"Score"}'
            };
        }


        request.post({
            url: url,
            formData: formData
        }, function (err, response, body) {

            if (!err && response.statusCode === 200) {
                token = body.substring(0, body.indexOf('<tr')).replace(/ /g, '');
                $ = cheerio.load(body);

                $('tr').each(function (index, movies) {

                    var find_link = $(movies).find('.dtl h1 a');

                    var link = $(find_link).attr('href');
                    var title = $(find_link).text();

                    data_content = {
                        number: film_count,
                        title: title,
                        link: link
                    };

                    film_count++;

                    stream_content.push(data_content);

                });

                selectStream(stream_content, "hd");

            } else {
                console.log(chalk.red.bold('There was a problem loading movietube'));
                main.AppInitialize();
            }

        });

    };

    var search = function (search) {
        count++;

        var data_content = {};
        var stream_content = [];
        var film_count = 0;
        var formData;
        var url = site_url + "/index.php";

        if (count === 1) {
            formData = {
                c: 'result',
                a: 'retrieve',
                p: '{"KeyWord":"' + search + '","Page":"1","NextToken":""}'
            };
        } else {
            formData = {
                c: 'result',
                a: 'retrieve',
                p: '{"KeyWord":"' + search + '","Page":"1","NextToken":"' + token.split(' ').join('').split('\n').join('') + '"}'
            };
        }


        request.post({
            url: url,
            formData: formData
        }, function (err, response, body) {

            if (!err && response.statusCode === 200) {
                token = body.substring(0, body.indexOf('<tr')).replace(/ /g, '');
                $ = cheerio.load(body);

                $('tr').each(function (index, movies) {

                    var find_link = $(movies).find('.dtl h1 a');

                    var link = $(find_link).attr('href');
                    var title = $(find_link).text();

                    data_content = {
                        number: film_count,
                        title: title,
                        link: link
                    };

                    film_count++;

                    stream_content.push(data_content);

                });

                selectStream(stream_content, "search");

            } else {
                console.log(chalk.red.bold('There was a problem loading movietube'));
                main.AppInitialize();
            }

        });

    };

    var selectStream = function (data, state) {
        var movie_object = [];

        data.forEach(function (movies) {
            movie_object.push({
                'key': movies.number,
                name: chalk.yellow(movies.title),
                value: movies.number
            });
        });

        if (state !== "search") {
            movie_object.push({
                'key': 'next',
                name: chalk.cyan('next page'),
                value: 'next'
            });
        }

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
            } else if (state == "cinema") {
                cinema();
            } else if (state == "new_release") {
                new_release();
            } else if (state == "hd") {
                hd();
            }
        });

    };

    var fetchStreamlinks = function (number, data) {
        var data_content = {};
        var movie_object = [];
        count = 1;

        var link = data[number].link.split('watch.php?v=').join('');
        var title = data[number].title;

        movie_title = title;

        var url = site_url + "/index.php";

        var formData = {
            c: 'result',
            a: 'getplayerinfo',
            p: '{"KeyWord":"' + link + '"}'
        };

        request.post({
            url: url,
            formData: formData
        }, function (err, response, body) {

            if (!err && response.statusCode === 200) {

                $ = cheerio.load(body);

                $('video.video-js source').each(function (index, movies) {

                    var res = $(movies).attr('data-res');
                    var link = $(movies).attr('src');

                    data_content = {
                        quality: res,
                        link: link,
                    };

                    movie_object.push(data_content);

                    count++;

                });

                selectStreamLink(movie_object);

            } else {

            }

        });

    };

    var selectStreamLink = function (data) {
        var movie_object = [];

        data.forEach(function (movie) {
            movie_object.push({
                'key': movie.link,
                name: chalk.yellow(movie.quality),
                value: movie.link
            });

        });

        inquirer.prompt([{
            type: "list",
            name: "movie",
            message: chalk.green.bold("Select a stream:"),
            choices: movie_object
        }], function (answer) {
            var movie = answer.movie;

            if (download_location) {
                inquirer.prompt([{
                    type: "list",
                    name: "stream",
                    message: "Do you want to stream or download the file ?",
                    choices: ["Stream", "Download"]
                }], function (answer) {
                    if (answer.stream == "Stream") {
                        getSubs(movie);
                    } else if (answer.stream == "Download") {
                        sod(movie);
                    }
                });
            } else {
                getSubs(movie);
            }


        });



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
            if (player_arg_cmd) {
                argsList = [movie, player_arg_cmd, player_sub_cmd + subtitles];
            } else {
                argsList = [movie, player_sub_cmd + subtitles];
            }

        } else {
            if (player_arg_cmd) {
                argsList = [movie, player_arg_cmd];
            } else {
                argsList = [movie];
            }

        }

        spawn(player, argsList, {
            stdio: 'inherit'
        });

    };

})();
