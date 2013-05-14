
var underscore = require("underscore");
var Commit = require("./commit");

function Branch(database, head) {
  this.database = database;
  this.head = head;
  this.stage = new Commit();
}

Branch.prototype.set = function(key, value) {
  this.stage.changes[key] = value;
}

Branch.prototype.get = function(key) {
  return this.stage.changes[key];
}

Branch.prototype.reset = function() {
  this.stage = new Commit()
}

Branch.prototype.commit = function(name, properties, callback) {
  if(this.head == null) {
    this.stage.parentIds = null;
  } else {
    this.stage.parentIds = [this.head.id];
  }
  
  this.stage.name = name || "";
  this.stage.properties = properties || {};
  this.stage.sign();
  
  var that = this;
  this.database.adapter.saveCommit(this.stage, function() {
    that.head = that.stage;
    that.reset();
    
    // TODO
    //this.database.mergeBranches();
    
    if (underscore.isFunction(callback)) callback();
  });
}

Branch.prototype.save = function(name, properties, changes, callback) {
  this.reset();
  
  for(var key in changes) {
    var value = changes[key];
    this.set(key, value);
  }
  
  this.commit(name, properties, callback);
}

Branch.prototype.load = function(keys, callback) {
  if(this.head) {
    this.database.adapter.load(keys, this.head.id, callback);
  } else {
    callback({})
  }
}

Branch.prototype.snapshot = function(callback) {
  var that = this;
  this.database.adapter.commits(function(results) {
    var commits = {}
    for(var i in results) {
      var result = results[i];
      commits[result.id] = result;
    }
    
    function traverse(item, seen) {
      var list = [];
      seen[item] = true;
      
      
      commits[item].parentIds = commits[item].parentIds || []
      var parents = commits[item].parentIds.sort();
      for(var i in parents) {
        var parent = parents[i];
        if(!seen[parent]) {
          seen[parent] = true;
          list.push(traverse(parent, seen));
        }
      }
      
      list.push(item);
      return underscore.flatten(list);
    }
    
    var history = traverse(that.head.id, {});
    
    var snapshot = {}
    history.forEach(function(item) {
      snapshot = underscore.extend(snapshot, commits[item].changes)
    })
    
    callback(snapshot);
  });
}



module.exports = Branch;

