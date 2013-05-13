
function Adapter() {
  
}

Adapter.prototype.load = function(keys, commitId, callback) {
  var values = {};
  
  if(keys.length == 0) {
    setTimeout(function() {callback(values);}, 0);
  }
  
  if(commitId == null) {
    setTimeout(function() {callback(values);}, 0);
  }
  
  var that = this;
  this.commits(commitId, function(commit) {
    
    console.log("commit!")
    var changes = commit.changes;
    var remainingKeys = []
    
    for(var i in keys) {
      var key = keys[i];
      if(key in changes) {
        values[key] = changes[key]
      } else {
        remainingKeys.push(key)
      }
    }
    
    var loadParents = function(parentIds) {
      parentIds = parentIds || [];
      
      if(remainingKeys.length == 0) {
        callback(values);
        return;
      }
      
      if(parentIds.length == 0) {
        callback(values);
        return;
      }
      
      that.load(remainingKeys, parentIds[0], function(childValues) {
        for(var key in childValues) {
          var value = childValues[key];
          values[key] = value;
          remainingKeys.splice(remainingKeys.indexOf(key), 1);
        }
        
        if(remainingKeys.length == 0) {
          callback(values);
          return;
        } else {
          loadParents(underscore.rest[parentIds])
        }
      });
    }
    
    loadParents(commit.parentIds)
  });
}

Adapter.prototype.root = function(callback) {
  throw new Error("Required method not implemented.")
}

Adapter.prototype.branches = function(callback) {
  throw new Error("Required method not implemented.")
}

Adapter.prototype.commits = function() {
  throw new Error("Required method not implemented.")
}

Adapter.prototype.saveCommit = function(commit, callback) {
  throw new Error("Required method not implemented.")
}

Adapter.prototype.snapshots = function() {
  throw new Error("Required method not implemented.")
}

Adapter.prototype.saveSnapshot = function(commit) {
  throw new Error("Required method not implemented.")
}

module.exports = Adapter;
