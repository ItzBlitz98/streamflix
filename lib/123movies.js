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
    var player_arg_cmd;


    exports.Initialize = start = function (config_object) {
        site_url = config_object.onetwothree;
        player = config_object.player;
        player_sub_cmd = config_object.player_sub_cmd;
        player_arg_cmd = config_object.player_arg_cmd;
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
                "Featured",
                "Most Watched",
                "Latest Movies",
                "Latest Tv Series",
                "Search",
                "Back to site selection"
            ]
        }], function (answer) {
            if (answer.section == "Featured") {
                featured();
            } else if (answer.section == "Latest Movies") {
                new_releases();
            } else if (answer.section == "Latest Tv Series") {
                new_releases_tv();
            } else if (answer.section == "Most Watched") {
                top();
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

    var new_releases = function () {
        var data_content = {};
        var stream_content = [];
        var film_count = 0;

        count++;

        var search_url = site_url + '/movies/page-' + count + '.html';

        request(search_url, function (err, response, body) {
            if (!err && response.statusCode === 200) {

                $ = cheerio.load(body);

                $('ul.list-movie li').each(function (index, movies) {

                    var link = $(this).find('a').attr('href').split('http://123movies.to').join('');
                    var title = $(this).find('.movie-meta .movie-title-1').text();

                    data_content = {
                        number: film_count,
                        title: title,
                        link: link
                    };

                    film_count++;

                    stream_content.push(data_content);


                });

                selectFilm(stream_content, "new_releases");

            }

        });
    };

    var new_releases_tv = function () {
        var data_content = {};
        var stream_content = [];
        var film_count = 0;

        count++;

        var search_url = site_url + '/tv-series//page-' + count + '.html';

        request(search_url, function (err, response, body) {
            if (!err && response.statusCode === 200) {

                $ = cheerio.load(body);

                $('ul.list-movie li').each(function (index, movies) {

                    var link = $(this).find('a').attr('href').split('http://123movies.to').join('');
                    var title = $(this).find('.movie-meta .movie-title-1').text();

                    data_content = {
                        number: film_count,
                        title: title,
                        link: link
                    };

                    film_count++;

                    stream_content.push(data_content);


                });

                selectFilm(stream_content, "new_releases_tv");

            }

        });
    };

    var top = function () {
        var data_content = {};
        var stream_content = [];
        var film_count = 0;

        count++;

        var search_url = site_url + '/top/';

        request(search_url, function (err, response, body) {
            if (!err && response.statusCode === 200) {

                $ = cheerio.load(body);

                $('ul.list-movie li').each(function (index, movies) {

                    var link = $(this).find('a').attr('href').split('http://123movies.to').join('');
                    var title = $(this).find('.movie-meta .movie-title-1').text();

                    data_content = {
                        number: film_count,
                        title: title,
                        link: link
                    };

                    film_count++;

                    stream_content.push(data_content);


                });

                selectFilm(stream_content, "top");

            }

        });
    };

    var featured = function () {
        count++;

        var data_content = {};
        var stream_content = [];
        var film_count = 0;

        var search_url = site_url;

        request(search_url, function (err, response, body) {
            if (!err && response.statusCode === 200) {

                $ = cheerio.load(body);

                $('.mcl-featured li a').each(function (index, movies) {

                    var title = $(movies).find('.movie-title-1').text();
                    var link = $(movies).attr('href');

                    //console.log(link);

                    data_content = {
                        number: film_count,
                        title: title,
                        link: link
                    };

                    film_count++;

                    stream_content.push(data_content);

                });

                selectFilm(stream_content, "featured");

            } else {
                console.log(chalk.red.bold('There was a problem loading 123movies'));
                main.AppInitialize();
            }
        });
    };

    var search = function (search) {
        count++;

        var data_content = {};
        var stream_content = [];
        var film_count = 0;

        var search_url = site_url + "/search/" + encodeURIComponent(search) + "/";

        request(search_url, function (err, response, body) {
            if (!err && response.statusCode === 200) {

                $ = cheerio.load(body);

                $('ul.list-movie li').each(function (index, movies) {

                    var link = $(this).find('a').attr('href').split('http://123movies.to').join('');
                    var title = $(this).find('.movie-meta .movie-title-1').text();

                    data_content = {
                        number: film_count,
                        title: title,
                        link: link
                    };

                    film_count++;

                    stream_content.push(data_content);


                });

                selectFilm(stream_content, "search");

            }

        });
    };

    var selectFilm = function (data, state) {

        var movie_object = [];

        data.forEach(function (data) {
            movie_object.push({
                'key': data.number,
                name: chalk.yellow(data.title),
                value: data.number
            });
        });

        if (state == "new_releases" || state == "new_releases_tv") {
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
                //console.log(answer.movie);
                fetchLinks(answer.movie, data);
            } else if (state == "new_releases") {
                new_releases();
            } else if (state == "new_releases_tv") {
                new_releases_tv();
            }
        });

    };

    var fetchLinks = function (movie, data) {

        var data_content = {};
        var stream_content = [];
        var film_count = 0;
        var link = data[movie].link;

        request(site_url + link, function (err, response, body) {
            //console.log(body);
            if (!err && response.statusCode === 200) {

                $ = cheerio.load(body);

                var movieTitle = $('h1.movie-title span.title-1').text();

                movie_title = movieTitle;

                var watchURL = $('.md-btn a.btn-md-play').attr('href');

                request(watchURL, function (err, response, body) {

                    if (!err && response.statusCode === 200) {

                        $ = cheerio.load(body);

                        //attempt to figure out if movie or tv ep

                        if ($('.server ul.server-list').contents().length > 0) {

                            var count = 1;

                            $('ul.server-list li a').each(function (index, server) {

                                var title = "Server " + count + ": " + $(server).text();
                                var link = $(server).attr('href');

                                data_content = {
                                    number: film_count,
                                    title: title,
                                    tv: false,
                                    link: link
                                };

                                film_count++;

                                stream_content.push(data_content);

                                count++;
                            });
                            //grab alt servers

                        } else if ($('.server ul.list-episode').contents().length > 0) {

                            //grab all eps
                            $('.server ul.list-episode li a').each(function (index, ep) {

                                var title = $(ep).text();
                                var link = $(ep).attr('href');

                                data_content = {
                                    number: film_count,
                                    title: title,
                                    tv: true,
                                    link: link
                                };

                                film_count++;

                                stream_content.push(data_content);

                            });

                        }

                        selectStream(stream_content);

                    }

                });

            }

        });


    };

    var selectStream = function (data) {

        var movie_object = [];

        data.forEach(function (data) {
            movie_object.push({
                'key': data.number,
                name: chalk.yellow(data.title),
                value: data.number
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
            message: chalk.green.bold("Select a server:"),
            choices: movie_object
        }], function (answer) {
            if (answer.movie == "cat") {
                initialize();
            } else if (answer.movie !== "next") {

                if (data[answer.movie].tv) {
                     movie_title = movie_title + " " + data[answer.movie].title;
                }
                
                parseStream(answer.movie, data);
            }
        });

    };

    var parseStream = function (number, data) {
        var data_content = {};
        var stream_content = [];
        var film_count = 0;
        var link = data[number].link;
        var id = link.substring(link.lastIndexOf("-") + 1, link.lastIndexOf("/"));

        request.post({
            url: site_url + '/index.php',
            form: {
                nextmovie: '1',
                e_id: id,
            }
        }, function (err, response, body) {
            $ = cheerio.load(body);

            var frame = $('iframe').attr('src');

            request(frame, function (err, response, body) {

                if (!err && response.statusCode === 200) {

                    $ = cheerio.load(body);

                    $('source').each(function (index, source) {

                        var url = $(source).attr('src');
                        var quality = $(source).attr('data-res');

                        data_content = {
                            number: film_count,
                            quality: quality,
                            url: url
                        };

                        film_count++;

                        stream_content.push(data_content);

                    });

                    selectMovie(stream_content);

                }
            });

        });


    };

    var selectMovie = function (data) {
        var movie_object = [];

        data.forEach(function (data) {
            movie_object.push({
                'key': data.number,
                name: chalk.blue(data.quality),
                value: data.number
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
            message: chalk.green.bold("Select quality:"),
            choices: movie_object
        }], function (answer) {
            if (answer.movie == "cat") {
                initialize();
            } else if (answer.movie !== "next") {

                var movie = data[answer.movie].url;

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
