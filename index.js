#!/usr/bin/env node

var os = require('os');
var fs = require('fs');
var path = require('path');
var http = require('http');
var https = require('https');
var util = require('util');
var connect = require('connect');
var serveStatic = require('serve-static');
var serveIndex = require('serve-index');
var fallback = require('connect-history-api-fallback');

var _ = require('lodash');
var debug = require('debug');
debug.enable('openserver');
var log = debug('openserver');



var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var ArgumentParser = require('argparse').ArgumentParser;
var parser = new ArgumentParser({
    version: require("./package.json").version,
    addHelp: true,
    description: 'static server'
});
parser.addArgument(['-p', '--port'], {
    help: 'port',
    dest: 'port'
})
parser.addArgument(['-d', '--dir'], {
    help: 'dir',
    dest: 'dir'
})
parser.addArgument(['-host', '--hostname'], {
    help: 'hostname',
    dest: 'hostname'
})

var argument = parser.parseArgs();
if (!_.isNull(argument.dir)) {
    var realPath = path.join(__dirname, argument.dir);
    var stat = fs.statSync(realPath);
    if (!stat.isDirectory()) {
        console.error(util.format('config dir %s not exist', argument.dir));
        process.exit(1)
    }
    argument.dir = realPath;
} else {
    argument.dir = process.cwd();
}
var openURL = function (url) {
    switch (process.platform) {
        case "darwin":
            exec('open ' + url);
            break;
        case "win32":
            exec('start ' + url);
            break;
        default:
            spawn('xdg-open', [url]);
    }
};
/**
 * Get ip(v4) address
 * @return {String} the ipv4 address or 'localhost'
 */
var getIPAddress = function () {
    var ifaces = os.networkInterfaces();
    var ip = '';
    for (var dev in ifaces) {
        ifaces[dev].forEach(function (details) {
            if (ip === '' && details.family === 'IPv4' && !details.internal) {
                ip = details.address;
                return;
            }
        });
    }
    return ip || "127.0.0.1";
};



var app = connect();
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    log('Serving: ' + req.method + ' ' + req.url);
    next();
});
app.use(serveStatic(argument.dir, {
    'index': ['index.html']
}));
app.use(serveIndex(argument.dir, {
    'icons': true
}));



var hostname = argument.hostname || getIPAddress();
var port = parseInt(argument.port || 8080, 10);
function createServer() {
    var self = this;    
    http.createServer(app).listen(port, function () {
        // 忽略80端口
        port = (port != 80 ? ':' + port : '');
        var url = "http://" + hostname + port + '/';
        log("Running at " + url);
        log("Watching files...")
        // 打开浏览器的操作
        openURL(url);
    }).on('error', function (error) {
        if (error.code === 'EADDRINUSE') { // 端口已经被使用
            log('The port【' + port + '】 is occupied, please change other port.');
            port += 1;
            createServer.call(self);
        }
    });
}
createServer();