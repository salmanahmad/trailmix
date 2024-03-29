
var express = require("express");
var logger = require("winston")
var http = require("http");
var path = require("path");
var hogan = require ("hogan.js");
var hoganAdapter = require ("hogan-express");
var util = require('util')

var app = express();
var dir = path.normalize(__dirname);
var env = process.env.NODE_ENV || "development";
var config = require("./config/config")[env];

app.set('port', process.env.PORT || config.port);
app.set('views', dir + '/app/views');
app.set('layout', 'layouts/default')
app.set('view engine', 'html');
app.engine('html', require('hogan-express'));

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser(config.cookieSecret));
app.use(express.cookieSession());
app.use(app.router);
app.use(express.static(dir + "/public"));

server = http.createServer(app)

require("./config/routes")(app)
//require("./config/socket")(server)

server.listen(app.get('port'), function(){
  logger.info('server listening on port ' + app.get('port'));
});

exports = module.exports = app
