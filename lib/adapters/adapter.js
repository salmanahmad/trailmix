
var underscore = require("underscore")

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
    var list1 = [];
    var list2 = [];
    
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
    
    function arrayToSet(array) {
      var set = {};
      array.forEach(function(val, i) {
        set[val] = true;
      })
      
      return set;
    }
    
    var history1 = traverse(branchId1, {});
    var history2 = traverse(branchId2, {});
    
    var difference = underscore.difference(history2, history1);
    difference = arrayToSet(difference);
    
    var baseId = null;
    for(var i = (history2.length - 1); i >= 0; i--) {
      baseId = history2[i];
      
      list2.unshift(commits[baseId]);
      
      if(difference[baseId]) {
        delete difference[baseId];
      }
      
      if(underscore.keys(difference).length == 0) {
        break;
      }
    }
    
    baseId = commits[baseId].parentIds.sort()[0];
    base = commits[baseId];
    
    for(var i = (history1.length - 1); i >= 0; i--) {
      var commitId = history1[i];
      
      list1.unshift(commits[commitId]);
      
      if(commitId == baseId) {
        break;
      }
    }
    
    callback(base, list1, list2);
  });
}

Adapter.prototype.root = function(callback) {
  throw new Error("Required method not implemented.")
}

Adapter.prototype.delete = function(callback) {
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

Adapter.prototype.mergeCommits = function(commits, callback) {
  var that = this;
  this.commits(function(existingCommits) {
    var commitSet = {}
    existingCommits.forEach(function(c) {
      commitSet[c.id] = true
    })
    
    function recur() {
      if(commits.length == 0) {
        if(underscore.isFunction(callback)) callback();
        return;
      }
      
      if(commitSet[commits[0].id]) {
        commits = underscore.rest(commits);
        recur();
      } else {
        that.saveCommit(commits[0], function() {
          commits = underscore.rest(commits);
          recur();
        })
      }
    }
    
    recur();
  })
}

Adapter.prototype.snapshots = function() {
  throw new Error("Required method not implemented.")
}

Adapter.prototype.saveSnapshot = function(commit) {
  throw new Error("Required method not implemented.")
}

module.exports = Adapter;
