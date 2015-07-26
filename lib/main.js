(function () {
    var inquirer = require("inquirer"),
        chalk = require('chalk'),
        yifySearch = require('./yifytv.js'),
        view47Search = require('./view47.js'),
        movietubeSearch = require('./movietube.js'),
        redditSearch = require('./reddit.js'),
        youtubeSearch = require('./youtube.js'),
        onetwothreemoviesSearch = require('./123movies.js'),
        config_object;


    exports.AppInitialize = start = function (config) {
        if (config) {
            config_object = config;
        }
        startApp();
    };

    var startApp = function () {

        var sites = [];

        if (config_object.yifytv) {
            sites.push({
                'key': 'yifytv',
                name: chalk.magenta('Yify TV'),
                value: 'yifytv'
            });
        }

        if (config_object.view47) {
            sites.push({
                'key': 'view47',
                name: chalk.magenta('View47'),
                value: 'view47'
            });
        }

        if (config_object.onetwothree) {
            sites.push({
                'key': '123movies',
                name: chalk.magenta('123movies'),
                value: '123movies'
            });
        }

        // if (config_object.movietube) {
        //     sites.push({
        //         'key': 'movietube',
        //         name: chalk.magenta('Movietube'),
        //         value: 'movietube'
        //     });
        // }

        if (config_object.reddit) {
            sites.push({
                'key': 'reddit',
                name: chalk.magenta('Reddit'),
                value: 'reddit'
            });
        }

        if (config_object.youtube) {
            sites.push({
                'key': 'youtube',
                name: chalk.magenta('Youtube Channels'),
                value: 'youtube'
            });
        }

        sites.push({
            'key': "exit",
            name: chalk.red.bold('Exit app'),
            value: "exit"
        });

        inquirer.prompt([{
            type: "list",
            name: "site",
            message: chalk.green.bold("What streaming site do you want to use?"),
            choices: sites
        }], function (answer) {
            siteSelect(answer.site);
        });

    };

    var siteSelect = function (answer) {
        if (answer == "yifytv") {
            yifytv();
        } else if (answer == "view47") {
            view47();
        } else if (answer == "movietube") {
            movietube();
        } else if (answer == "123movies"){
          onetwothreemovies();
        } else if (answer == "reddit") {
            reddit();
        } else if (answer == "youtube") {
            youtube();
        } else if (answer == "exit") {
            exitApp();
        }
    };

    var yifytv = function () {
        yifySearch.yifytvInitialize(config_object);
    };

    var view47 = function () {
        view47Search.Initialize(config_object);
    };

    var onetwothreemovies = function () {
        onetwothreemoviesSearch.Initialize(config_object);
    };

    var movietube = function () {
        movietubeSearch.Initialize(config_object);
    };

    var reddit = function () {
        redditSearch.Initialize(config_object);
    };

    var youtube = function () {
        youtubeSearch.Initialize(config_object);
    };

    var exitApp = function () {
        console.log(chalk.red.bold("Exiting app..."));
        process.exit(code = 0);
    };

})();
