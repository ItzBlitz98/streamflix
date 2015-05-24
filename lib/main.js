(function () {
    var inquirer = require("inquirer"),
        chalk = require('chalk'),
        yifySearch = require('./yifytv.js'),
        view47Search = require('./view47.js'),
        pctfSearch = require('./popcorntimefree.js'),
        movietubeSearch = require('./movietube.js'),
        redditSearch = require('./reddit.js'),
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

        sites.push({
            'key': 'pctf',
            name: chalk.magenta('Popcorn Time Free'),
            value: 'pctf'
        });


        if (config_object.view47) {
            sites.push({
                'key': 'view47',
                name: chalk.magenta('View47'),
                value: 'view47'
            });
        }

        if (config_object.movietube) {
            sites.push({
                'key': 'movietube',
                name: chalk.magenta('Movietube'),
                value: 'movietube'
            });
        }

        if (config_object.reddit) {
            sites.push({
                'key': 'reddit',
                name: chalk.magenta('Reddit'),
                value: 'reddit'
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
        } else if (answer == "pctf") {
            pctf();
        } else if (answer == "movietube") {
            movietube();
        } else if (answer == "reddit"){
            reddit();
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

    var pctf = function () {
        pctfSearch.Initialize(config_object);
    };

    var movietube = function () {
        movietubeSearch.Initialize(config_object);
    };

    var reddit = function () {
      redditSearch.Initialize(config_object);
    };

    var exitApp = function () {
        console.log(chalk.red.bold("Exiting app..."));
        process.exit(code = 0);
    };

})();
