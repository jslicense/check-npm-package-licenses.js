var async = require('async');
var fs = require('fs');
var glob = require('glob');
var path = require('path');
var rimraf = require('rimraf');
var spawn = require('child_process').spawn;
var spdx = require('spdx');
var temp = require('temp');

module.exports = function(package, version, callback) {
  temp.mkdir('check-licenses', function(error, temporary) {
    if (error) {
      callback(error);
    } else {
      process.chdir(temporary);
      async.series([
        fs.mkdir.bind(fs, path.join(temporary, 'node_modules')),
        function(callback) {
          var dependencies = {};
          dependencies[package] = version;
          fs.writeFile(
            path.join(temporary, 'package.json'),
            JSON.stringify({dependencies: dependencies}),
            callback
          );
        },
        function(callback) {
          spawn('npm', ['install'])
            .on('exit', function(code) {
              callback(code === 0 ? null : 'Error installing');
            });
        }
      ], function(error) {
        if (error) {
          callback(error);
        } else {
          glob('node_modules/**/package.json', function(error, files) {
            async.reduce(files, [], function(memo, file, callback) {
              fs.readFile(file, function(error, buffer) {
                var json = JSON.parse(buffer);
                var name = json.name;
                var license = json.license;
                var version = json.version;
                if (!license) {
                  if (json.licenses) {
                    callback(null, memo.concat({
                      name: name,
                      version: json.version,
                      message: 'Package ' + name + '@' + version +
                        ' has deprecated license metadata.'
                    }));
                  } else {
                    callback(null, memo.concat({
                      name: name,
                      version: json.version,
                      message: 'Package ' + name + '@' + version +
                        ' has no license metadata.'
                    }));
                  }
                } else if (
                  typeof license === 'string' &&
                  spdx.valid(license)
                ) {
                  callback(null, memo);
                } else {
                  callback(null, memo.concat({
                    name: json.name,
                    version: json.version,
                    license: license,
                    licenses: json.licenses,
                    message: 'Package ' + name + '@' + version +
                      ' has invalid license metadata ' +
                      JSON.stringify(license) + '.'
                  }));
                }
              });
            }, function(error, problems) {
              rimraf(temporary, function() {
                callback(error, problems);
              });
            });
          });
        }
      });
    }
  });
};
