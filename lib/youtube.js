(function () {
    var request = require('request'),
        async = require("async"),
        chalk = require('chalk'),
        inquirer = require('inquirer'),
        spawn = require('child_process').spawn,
        main = require('./main.js'),
        subtitles = require('./subtitles.js');

    var count = 0;
    var player;
    var apiKey = "AIzaSyAmme4rT0MO9DXIJNRAVFp-8ijreaYxvko";
    var player_sub_cmd;
    var site_url;
    var channels;
    var movie_title;
    var subtitle_language;
    var use_subtitle;
    var download_location;
    var player_arg_cmd;

    exports.Initialize = start = function (config_object) {
        player = config_object.player;
        channels = config_object.youtube;
        player_sub_cmd = config_object.player_sub_cmd;
        use_subtitle = config_object.subtitles;
        player_arg_cmd = config_object.player_arg_cmd;
        subtitle_language = config_object.subtitle_lang;
        download_location = config_object.download_location;
        initialize();
    };

    var initialize = function () {

        var channel_object = [];

        async.each(channels,

            function (item, callback) {

                var url;

                if (item.substr(0, 2) == "UC") {

                    url = "https://www.googleapis.com/youtube/v3/search?key=" + apiKey + "&channelId=" + item + "&part=snippet,id&order=date&maxResults=1";

                    request(url, function (err, response, body) {
                        if (!err && response.statusCode === 200) {

                            data = JSON.parse(body);

                            var title = data.items[0].snippet.channelTitle;

                            channel_object.push({
                                'key': item,
                                name: chalk.yellow("Channel: " + title),
                                value: item
                            });

                            callback();

                        }
                    });

                } else if (item.substr(0, 2) == "PL") {

                    url = "https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=" + item + "&key=" + apiKey;

                    request(url, function (err, response, body) {
                        if (!err && response.statusCode === 200) {

                            data = JSON.parse(body);

                            var title = data.items[0].snippet.title;

                            channel_object.push({
                                'key': item,
                                name: chalk.yellow("Playlist: " + title),
                                value: item
                            });

                            callback();

                        }
                    });

                }

            },

            function (err) {

                if (!err) {

                    channel_object.push({
                        'key': 'site',
                        name: chalk.cyan('Back to site selection'),
                        value: 'site'
                    });

                    inquirer.prompt([{
                        type: "list",
                        name: "youtube",
                        message: chalk.green.bold("Select channel:"),
                        choices: channel_object
                    }], function (answer) {

                        if (answer.youtube == "site") {
                            main.AppInitialize();

                        } else if (answer.youtube.substr(0, 2) == "UC") {

                            channelVideo(answer.youtube);

                        } else if (answer.youtube.substr(0, 2) == "PL") {

                            parsePlaylistVideos(answer.youtube);

                        }

                    });
                } else {
                    //throw an error back here
                }

            }
        );
    };


    var channelVideo = function (youtube) {
        inquirer.prompt([{
            type: "list",
            name: "section",
            message: chalk.green.bold("Select site section:"),
            choices: [{
                key: "video",
                name: chalk.yellow("List videos"),
                value: "video"
            }, {
                key: "playlist",
                name: chalk.yellow("List playlists"),
                value: "playlist"
            }]
        }], function (answer) {

            if (answer.section === "video") {

                fetchVideos(youtube);

            } else if (answer.section === "playlist") {

                fetchPlaylist(youtube);

            }

        });

    };

    var fetchVideos = function (youtube_user) {
        var data_content = {};
        var stream_content = [];
        var film_count = 0;

        var url = "https://www.googleapis.com/youtube/v3/search?key=" + apiKey + "&channelId=" + youtube_user + "&part=snippet,id&order=date&maxResults=20";

        request(url, function (err, response, body) {
            if (!err && response.statusCode === 200) {

                data = JSON.parse(body);


                var items = data.items;


                items.forEach(function (videos) {

                    var title = videos.snippet.title;
                    var watchid = videos.id.videoId;

                    if (watchid) {

                        data_content = {
                            number: film_count,
                            title: title,
                            watch: watchid
                        };

                        film_count++;

                        stream_content.push(data_content);

                    }

                });

                selectVideo(stream_content);

            }
        });

    };

    var fetchPlaylist = function (youtube_user) {

        var playlistObj = [];

        var url = "https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=" + youtube_user + "&key=" + apiKey + "&order=date&maxResults=20";

        request(url, function (err, response, body) {
            if (!err && response.statusCode === 200) {

                data = JSON.parse(body);


                var items = data.items;


                items.forEach(function (videos) {

                    var title = videos.snippet.title;
                    var playlistId = videos.id;

                    playlistObj.push({
                        'key': playlistId,
                        name: chalk.yellow(title),
                        value: playlistId
                    });

                });

                selectPlaylist(playlistObj);

            }
        });

    };

    var selectPlaylist = function (playlistObj) {

        inquirer.prompt([{
            type: "list",
            name: "youtubePlaylist",
            message: chalk.green.bold("Select playlist:"),
            choices: playlistObj
        }], function (answer) {
            parsePlaylistVideos(answer.youtubePlaylist);
        });

    };


    var parsePlaylistVideos = function (playlist) {

        var data_content = {};
        var stream_content = [];
        var film_count = 0;

        var url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=25&playlistId=" + playlist + "&key=" + apiKey;

        request(url, function (err, response, body) {
            if (!err && response.statusCode === 200) {

                data = JSON.parse(body);

                var items = data.items;

                items.forEach(function (videos) {

                    var title = videos.snippet.title;
                    var watchID = videos.snippet.resourceId.videoId;

                    data_content = {
                        number: film_count,
                        title: title,
                        watch: watchID
                    };

                    film_count++;

                    stream_content.push(data_content);

                });

                selectVideo(stream_content);

            }
        });

    };

    var selectVideo = function (videoObj) {

        var video_object = [];

        if (data['0'] !== null) {
            videoObj.forEach(function (videos) {
                video_object.push({
                    'key': videos.number,
                    name: chalk.yellow(videos.title),
                    value: videos.number
                });
            });

            video_object.push({
                'key': 'cat',
                name: chalk.cyan('back to category select'),
                value: 'cat'
            });
            inquirer.prompt([{
                type: "list",
                name: "movie",
                message: chalk.green.bold("Select a movie:"),
                choices: video_object
            }], function (answer) {
                if (answer.movie == "cat") {
                    initialize();
                } else if (answer.movie !== "next") {
                    startStream(answer.movie, videoObj);
                }
            });
        } else {
            console.log(chalk.red.bold('There does not seem to be any youtube videos in this channel / playlist'));
            main.AppInitialize();
        }

    };

    var startStream = function (number, videoObj) {
        var watch = videoObj[number].watch;
        var title = videoObj[number].title;

        movie_title = title;

        getSubs(watch);

    };

    var getSubs = function (movie) {

        movie = "https://www.youtube.com/watch?v=" + movie;

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
