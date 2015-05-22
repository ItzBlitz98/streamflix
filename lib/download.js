(function () {
    var fs = require('fs');
    var request = require('request');
    var progress = require('request-progress');
    var chalk = require('chalk');
    var main = require('./main.js');

    exports.fetch = start = function (download_url, title, download_location) {

        var location = download_location;
        var filetype;

        if (location) {

          request
            .get(download_url)
            .on('response', function(response) {
              if(response.statusCode){
              var content = response.headers['content-type'];

              filetype = content.substring(content.indexOf("/") + 1);

              progress(request(download_url), {

                  })
                  .on('response', function (response) {

                  })
                  .on('progress', function (state) {
                      //bar.tick(chunk.received);
                      process.stdout.write("Downloading: " + chalk.green.bold(humanFileSize(state.received, true)) + " of " + chalk.blue.bold(humanFileSize(state.total, true)) + "\r");
                      //process.stdout.write("Downloading " + state.percent + "\r");
                      //process.stdout.write("Downloading: " + chalk.green.bold(humanFileSize(state.received, true)) + " of " + chalk.blue.bold(humanFileSize(state.total, true)));
                      //process.stdout.write('\r');
                  })
                  .on('end', function (err) {
                      console.log(chalk.green.bold("File downloaded and saved as " + location + title + ".mp4"));
                  })
                  .on('error', function (err) {
                      // Do something with err
                  })
                  .pipe(fs.createWriteStream(location + title + "." + filetype));
              } else {
                console.log(chalk.bold.red("There was a problem downloading the file."));
                main.AppInitialize();
              }
            });

        } else {
            console.log(chalk.bold.red("You haven't set a download location."));
            console.log(chalk.bold.red("Open config.yaml and set one."));
        }



    };

    function humanFileSize(bytes, si) {
        var thresh = si ? 1000 : 1024;
        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }
        var units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        var u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while (Math.abs(bytes) >= thresh && u < units.length - 1);
        return bytes.toFixed(1) + '' + units[u];
    }

})();
