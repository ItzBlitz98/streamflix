(function () {

    var request = require('request'),
        chalk = require('chalk'),
        inquirer = require('inquirer'),
        cheerio = require('cheerio'),
        spawn = require('child_process').spawn,
        main = require('./main.js'),
        subtitles = require('./subtitles.js');

    var count = 0;
    var player;
    var player_sub_cmd;
    var site_url;
    var movie_title;
    var subtitle_language;
    var use_subtitle;

    exports.Initialize = start = function (config_object) {
      site_url = config_object.view47;
      player = config_object.player;
      player_sub_cmd = config_object.player_sub_cmd;
      use_subtitle = config_object.subtitles;
      subtitle_language = config_object.subtitle_lang;
      initialize();
    };

    var initialize = function () {
        inquirer.prompt([{
            type: "list",
            name: "section",
            message: chalk.green.bold("Select site section:"),
            choices: [
                "New Releases",
                "Featured",
                "Most Popular",
                //"Last Added",
                "Search",
                "Back to site selection"
            ]
        }], function (answer) {

            if (answer.section == "New Releases") {
                new_releases();
            } else if (answer.section == "Featured") {
                featured();
            } else if (answer.section == "Most Popular") {
                popular();
            } else if (answer.section == "Last Added") {
                //releases();
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


    var featured = function () {

        count++;

        var data_content = {};
        var stream_content = [];
        var film_count = 0;

        var options = {
            url: site_url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.43 Safari/537.36'
            },
        };


        request(options, function (err, response, body) {

            $ = cheerio.load(body);

            $('.slider ul li').each(function (index, movies) {

                var find_link = $(this).find('a');

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

            selectStream(stream_content, "featured");

        });
    };

    var new_releases = function () {

        count++;

        var data_content = {};
        var stream_content = [];
        var film_count = 0;

        var options = {
            url: site_url + '/list/single-movies.html',
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.43 Safari/537.36'
            },
        };


        request(options, function (err, response, body) {

            $ = cheerio.load(body);

            $('ul.ip_tip li').each(function (index, movies) {

                var find_link = $(this).find('a');
                var link = $(find_link).attr('href');
                var title = $(find_link).attr('title');

                data_content = {
                    number: film_count,
                    title: title,
                    link: link
                };

                film_count++;

                stream_content.push(data_content);

            });

            selectStream(stream_content, "new_releases");

        });

    };


    var releases = function () {


    };

    var search = function (search) {
      var search_term = search.split(' ').join('+');
      var data_content = {};
      var stream_content = [];
      var film_count = 0;

      var options = {
          url: site_url + '/search/' + search_term + '.html',
          headers: {
              'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.43 Safari/537.36'
          },
      };


      request(options, function (err, response, body) {

        $ = cheerio.load(body);

        $('ul.ip_tip li').each(function (index, movies) {

            var find_link = $(this).find('a');
            var link = $(find_link).attr('href');
            var title = $(find_link).attr('title');

            data_content = {
                number: film_count,
                title: title,
                link: link
            };

            film_count++;

            stream_content.push(data_content);

        });

        selectStream(stream_content, "search");

      });


    };


    var popular = function () {

        count++;

        var data_content = {};
        var stream_content = [];
        var film_count = 0;

        var options = {
            url: site_url + '/billboard/index.html',
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.43 Safari/537.36'
            },
        };


        request(options, function (err, response, body) {

            $ = cheerio.load(body);

            var sidebar = $('.sidebar').eq(2);


            var find_link = $(sidebar).find('.name a');

            $(find_link).each(function (index, movies) {

                var link = $(movies).attr('href');
                var title = $(movies).attr('title');

                data_content = {
                    number: film_count,
                    title: title,
                    link: link
                };

                film_count++;

                stream_content.push(data_content);

            });

            selectStream(stream_content, "popular");

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
        var data_content = {};
        var movie_object = [];
        count = 1;

        var link = data[number].link;
        var title = data[number].title;

        movie_title = title;

        var options = {
            url: link,
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.43 Safari/537.36'
            },
        };

        request(options, function (err, response, body) {
            if (!err && response.statusCode === 200) {

                var find_links = body.match(/sources:(.+)\}]/i);
                if(find_links){
                  var match_links = find_links[0].match(/(https?:\/\/[^\s]+)/g);



                  match_links.forEach(function (s) {

                      data_content = {
                          number: count,
                          link: s.split('",label:').join(''),
                      };

                      movie_object.push(data_content);

                      count++;

                  });

                  selectStreamLink(movie_object);
                } else {
                  console.log(chalk.red.bold("No playable sources for this movie."));
                  initialize();
                }

            }
        });

    };

    var selectStreamLink = function (data) {
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
          getSubs(answer.movie.link);
        });

    };

    var getSubs = function(movie){
      if(use_subtitle){

        subtitles.fetchSub(subtitle_language, movie_title).then(function(data) {

          if(data !== false){
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


    var spawnPlayer = function(movie, subtitles){

      if(subtitles){
        argsList = [movie, player_sub_cmd + subtitles];
      } else {
        argsList = [movie];
      }

      spawn(player, argsList, { stdio: 'inherit' });

    };

})();
