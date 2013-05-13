
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
  this.commit(commitId, function(commit) {
    
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

// Returns the common ancestor that has all of the commits and the list of
// commits between the base to branch2 that are not covered in branch1.
Adapter.prototype.commonBase = function(branchId1, branchId2, callback) {
  this.commits(function(results) {
    var base = null;
    var list = [];
    
    var commits = {}
    for(var i in results) {
      var result = results[i];
      commits[result.id] = result;
    }
    
    function history(start) {
      var queue = [];
      var seen = {};
      var history = [];
      
      queue.push(start);
      seen[start] = true;
      
      while(queue.length != 0) {
        var item = queue.shift();
        history.push(item);
        
        var parents = commits[item].parentIds.sort()
        for(var i in parents) {
          var parent = parents[i];
          if(!seen[parent]) {
            seen[parent] = true;
            queue.push(parent);
          }
        }
      }
      
      return history;
    }
    
    function arrayToSet(array) {
      var set = {}
      array.forEach(function(val, i) {
        set[value] = true
      })
      
      return set;
    }
    
    var branch1History = history(branchId1);
    var branch2History = history(branchId2);
    
    var branch2UniqueCommitsSet = underscore.difference(branch2History, branch1History);
    
    branch2UniqueCommitsSet = arrayToSet(branch2UniqueCommitsSet);
    branch1History = arrayToSet(branch1History);
    
    var queue = [];
    var seen = {};
    
    queue.push(branchId2);
    seen[branchId2] = true;
    
    while(queue.length != 0) {
      var item = queue.shift();
      delete branch2UniqueCommitsSet[item];
      
      var parents = commits[item].parentIds.sort()
      for(var i in parents) {
        var parent = parents[i];
        if(!seen[parent]) {
          seen[parent] = true;
          queue.push(parent);
        }
      }
      
      if(!(item in branch1History)) {
        list.unshift(commits[item]);
      }
      
      if(branch2UniqueCommitsSet.length == 0) {
        base = commits[item].parentIds.sort()[0];
        break;
      }
    }
    
    callback(base, list);
  });
}

Adapter.prototype.root = function(callback) {
  throw new Error("Required method not implemented.")
}

Adapter.prototype.branches = function(callback) {
  throw new Error("Required method not implemented.")
}

Adapter.prototype.commit = function(commitId, callback) {
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
