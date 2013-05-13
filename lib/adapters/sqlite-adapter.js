
var util = require("util");
var underscore = require("underscore");
var sqlite3 = require('sqlite3').verbose();

var Adapter = require("./adapter");
var Commit = require("../commit");

function SQLiteAdapter(options, callback) {
  var defaultOptions = {
    file: "trailmix.db",
    name: "trailmix"
  }
  
  var options = underscore.defaults(options || {}, defaultOptions);
  
  this.file = options.file;
  this.name = options.name;
  
  var db = new sqlite3.Database(options.file);
  this.db = db;
  
  db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS commits ( \
      id TEXT PRIMARY KEY, \
      parentIds TEXT, \
      name TEXT, \
      properties TEXT, \
      changes TEXT, \
      head INT \
    )", function() {
      callback();
    })
  });
}
util.inherits(SQLiteAdapter, Adapter);

SQLiteAdapter.prototype.root = function(callback) {
  this.db.serialize(function() {
    this.get("SELECT * FROM commits WHERE parentIds IS NULL", function(err, row) {
      callback(convertRowToCommit(row))
    });
  })
}

SQLiteAdapter.prototype.branches = function(callback) {
  this.db.serialize(function() {
    var branches = []
    this.each("SELECT * FROM commits WHERE head = 1", function(err, row) {
      branches.push(convertRowToCommit(row))
    }, function() {
      callback(branches)
    });
  })
}

SQLiteAdapter.prototype.commits = function() {
  var commitId = arguments[0];
  var startId = null;
  var callback = null;
  
  if(underscore.isFunction(arguments[1])) {
    callback = arguments[1];
  } else {
    startId = arguments[1];
    callback = arguments[2];
  }
  
  if(startId == null) {
    this.db.serialize(function() {
      this.get("SELECT * FROM commits WHERE id = ?", commitId, function(err, row) {
        callback(convertRowToCommit(row))
      })
    })
  } else {
    
  }
}

SQLiteAdapter.prototype.saveCommit = function(commit, callback) {
  this.db.serialize(function() {
    if(commit.parentIds) {
      this.run("UPDATE commits SET head = 0 WHERE id IN (?)", commit.parentIds.join(",")) 
    }
    
    this.run("INSERT INTO commits VALUES ($id, $parentIds, $name, $properties, $changes, $head)", 
      convertCommitToRow(commit),
      function() {
        callback();
      }
    )
  })
}

SQLiteAdapter.prototype.snapshots = function() {
  // TODO
}

SQLiteAdapter.prototype.saveSnapshot = function(commit) {
  // TODO
}

function convertRowToCommit(row) {
  var commit = new Commit();
  commit.id = row.id;
  commit.parentIds = JSON.parse(row.parentIds);
  commit.name = row.name;
  commit.properties = JSON.parse(row.properties);
  commit.changes = JSON.parse(row.changes);
  
  return commit;
}

function convertCommitToRow(commit) {
  var row = {
    $id: commit.id,
    $parentIds: JSON.stringify(commit.parentIds),
    $name: commit.name,
    $properties: JSON.stringify(commit.properties),
    $changes: JSON.stringify(commit.changes),
    $head: 1
  }
  
  return row;
}

module.exports = SQLiteAdapter;
