
var SQLiteAdapter = require("./sqlite-adapter");
var WebSQLAdapter = require("./websql-adapter");

module.exports = {
  "sqlite": SQLiteAdapter,
  "websql": WebSQLAdapter
}
