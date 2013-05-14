
var util = require("util");
var underscore = require("underscore");

var Adapter = require("./adapter");
var Commit = require("../commit");

function WebSQLAdapter(options, callback) {
  var defaultOptions = {
    name: "trailmix",
    description: "TrailMix Database"
  }
  
  var options = underscore.defaults(options || {}, defaultOptions);
  var db = openDatabase(options.name, '1.0', options.description, 2 * 1024 * 1024);
  
  db.transaction(function(tx) {
    tx.executeSql("CREATE TABLE IF NOT EXISTS commits ( \
      id TEXT PRIMARY KEY, \
      parentIds TEXT, \
      name TEXT, \
      properties TEXT, \
      changes TEXT, \
      head INT \
    )")
    
    callback()
  })
  this.db = db;
}
util.inherits(WebSQLAdapter, Adapter);

WebSQLAdapter.prototype.root = function(callback) {
  this.db.transaction(function(tx) {
    tx.executeSql("SELECT * FROM commits WHERE parentIds IS NULL", [], function (tx, results) {
      var row = results.rows.item(0)
      callback(convertRowToCommit(row))
    });
  })
}

WebSQLAdapter.prototype.branches = function(callback) {
  this.db.transaction(function(tx) {
    tx.executeSql("SELECT * FROM commits WHERE head = 1", [], function (tx, results) {
      var branches = [];
      
      var len = results.rows.length;
      for (var i = 0; i < len; i++) {
        var row = results.rows.item(i);
        branches.push(convertRowToCommit(row))
      }
      
      callback(branches);
    });
  })
}

WebSQLAdapter.prototype.commit = function(commitId, callback) {
  this.db.transaction(function(tx) {
    tx.executeSql("SELECT * FROM commits WHERE id = ?", [commitId], function (tx, results) {
      var row = results.rows.item(0)
      callback(convertRowToCommit(row))
    });
  })
}

WebSQLAdapter.prototype.commits = function(options, callback) {
  var defaults = {
    head: null,
    base: null
  }
  
  if(arguments.length == 1) {
    var options = {};
    callback = arguments[0];
  }
  
  options = underscore.defaults(options, defaults);
  
  if(options.head == null && options.base == null) {
    this.db.transaction(function(tx) {
      tx.executeSql("SELECT * FROM commits", [], function (tx, results) {
        var commits = [];
        
        var len = results.rows.length;
        for (var i = 0; i < len; i++) {
          var row = results.rows.item(i);
          commits.push(row)
        }
        
        callback(commits);
      });
    })
  } else {
    // TODO
  }
}

WebSQLAdapter.prototype.saveCommit = function(commit, callback) {
  this.db.transaction(function(tx) {
    if(commit.parentIds) {
      tx.executeSql("UPDATE commits SET head = 0 WHERE id IN (?)", [commit.parentIds.join(",")]) 
    }
    
    tx.executeSql("INSERT INTO commits VALUES (?, ?, ?, ?, ?, ?)", 
      convertCommitToRow(commit),
      function() {
        callback();
      }
    )
  })
}

WebSQLAdapter.prototype.snapshots = function() {
  // TODO
}

WebSQLAdapter.prototype.saveSnapshot = function(commit) {
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
  var row = [
    commit.id,
    JSON.stringify(commit.parentIds),
    commit.name,
    JSON.stringify(commit.properties),
    JSON.stringify(commit.changes),
    1
  ]
  
  return row;
}

module.exports = WebSQLAdapter;
