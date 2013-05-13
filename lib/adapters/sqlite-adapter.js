
var util = require("util");
var underscore = require("underscore");
var Adapter = require("./adapter");

function SQLiteAdapter(options) {
  var defaultOptions = {
    name: "trailmix.db"
  }
  
  var options = underscore.defaults(options || {}, defaultOptions);
  this.name = options.name;
}
util.inherits(SQLiteAdapter, Adapter);

module.exports = SQLiteAdapter;
