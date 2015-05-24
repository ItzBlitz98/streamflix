var program = require("commander"),
    request = require('request'),
    chalk = require('chalk'),
    yaml = require('js-yaml'),
    path = require('path'),
    fs = require('fs'),
    main = require("./main"),
    pkg = require("../package.json"),
    appDir = path.dirname(require.main.filename).split('bin').join('').split('//').join('/'),
    configFile = appDir + "config.yaml";

//grab the config file on start
try {
    var config_object = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'));
    //do an update check
    var url = "https://raw.githubusercontent.com/ItzBlitz98/streamflix/master/package.json";
    request(url, function (err, response, body) {
        if (!err && response.statusCode === 200) {
            data = JSON.parse(body);
            if (data.version > pkg.version) {
                console.log(chalk.bold.red('A new version of streamflix is available.'));
                console.log(chalk.bold.red('Go here to get it: https://github.com/ItzBlitz98/streamflix'));
            }

            main.AppInitialize(config_object);

        } else {
            main.AppInitialize(config_object);
        }
    });
} catch (e) {
    console.log(e);
}
