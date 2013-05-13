
function Adapter() {
  
}

Adapter.prototype.root = function() {
  throw new Error("Required method not implemented.")
}

Adapter.prototype.branches = function() {
  throw new Error("Required method not implemented.")
}

Adapter.prototype.load = function(keys, commitId) {
  var values = {};
  
  if(keys.length == 0) {
    return null;
  }
  
  if(commitId == null) {
    return null;
  }
  
  var commit = this.commits(commitId);
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
  
  for(var i in c.parentIds) {
    if(remainingKeys.length != 0) {
      break;
    }
    
    var parentId = c.parentIds[i];
    var childValues = this.load(remainingKeys, parentId);
    
    for(var key in childValues) {
      var value = childValues[key];
      values[key] = value;
      remainingKeys.splice(remainingKeys.indexOf(key), 1);
    }
  }
  
  return values;
}

Adapter.prototype.commits = function(commitId, startId) {
  throw new Error("Required method not implemented.")
}

Adapter.prototype.saveCommit = function(commit) {
  throw new Error("Required method not implemented.")
}

Adapter.prototype.snapshots = function() {
  throw new Error("Required method not implemented.")
}

Adapter.prototype.saveSnapshot = function(commit) {
  throw new Error("Required method not implemented.")
}

module.exports = Adapter;
