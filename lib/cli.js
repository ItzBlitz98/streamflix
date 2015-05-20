var program = require("commander"),
    yaml = require('js-yaml'),
    path = require('path'),
    fs = require('fs'),
    main = require("./main"),
    appDir = path.dirname(require.main.filename).split('bin').join(''),
    configFile = appDir + "/config.yaml";

//grab the config file on start
try {
    var config_object = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'));
    main.AppInitialize(config_object);
} catch (e) {
    console.log(e);
}
