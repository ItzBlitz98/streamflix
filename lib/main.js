(function () {
    var inquirer = require("inquirer"),
        chalk = require('chalk'),
        yifySearch = require('./yifytv.js'),
        view47Search = require('./view47.js'),
        movbucketSearch = require('./movbucket.js'),
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
            'key': 'movbucket',
            name: chalk.magenta('MovBucket'),
            value: 'movbucket'
        });


        if (config_object.view47) {
            sites.push({
                'key': 'view47',
                name: chalk.magenta('View47'),
                value: 'view47'
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
        } else if (answer == "movbucket") {
            movbucket();
        } else if (answer == "exit") {
            exitApp();
        }
    };

    var yifytv = function () {
        //grab the url from the config object
        var url = config_object.yifytv;
        var player = config_object.player;
        yifySearch.yifytvInitialize(url, player);
    };

    var view47 = function () {
        var url = config_object.view47;
        var player = config_object.player;

        view47Search.Initialize(url, player);

    };

    var movbucket = function () {
        var url = config_object.movbucket;
        var player = config_object.player;

        movbucketSearch.Initialize(url, player);

    };

    var exitApp = function () {
        console.log(chalk.red.bold("Exiting app..."));
        process.exit(code = 0);
    };

})();
