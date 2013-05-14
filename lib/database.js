
var Commit = require('./commit')
var Branch = require('./branch')
//var adapters = require('./adapters');

function Database(adapter) {
  //if(!(adapter in adapters)) {
  //  throw new Error("Adapter " + adapter + " not found.")
  //}
  
  //this.adapter = new adapters[adapter](properties, callback);
  this.adapter = adapter
  this.resolveConflict = null;
  this.defaultRemote = null;
  this.remotes = {};
  
  this.conflict(function(conflicts, branches, merge, callback) {
    callback(masterBranch);
  });
}

Database.prototype.conflict = function(callback) {
  this.resolveConflict = callback;
}

Database.prototype.delete = function(callback) {
  this.adapter.delete(function() {
    callback()
  })
}

Database.prototype.currentBranch = function(callback) {
  var that = this;
  this.adapter.branches(function(branches) {
    if(branches.length == 0) {
      callback(new Branch(that, null));
    } else if(branches.length == 1) {
      callback(new Branch(that, branches[0]));
    } else {
      that.mergeBranches(branches[0], branches[1], function() {
        that.currentBranch(callback);
      });
    }
  });
}

Database.prototype.save = function(name, properties, changes, callback) {
  this.currentBranch(function(branch) {
    branch.save(name, properties, changes, callback);
  });
}

Database.prototype.load = function(keys, callback) {
  this.currentBranch(function(branch) {
    branch.load(keys, callback);
  });
}

Database.prototype.mergeBranches = function(branch1, branch2, callback) {
  var branches = [branch1, branch2].sort();
  var branch1 = branches[0];
  var branch2 = branches[1];
  
  this.adapter.commonBase(branch1, branch2, function(base, list1, list2) {
    var db1 = {};
    var db2 = {};
    
    var commitMap1 = {};
    var commitMap2 = {};
    
    list1.forEach(function(value) {
      commitMap1[value.id] = true;
      db1.extend(db1, value.changes);
    })
    
    list2.forEach(function(value) {
      commitMap2[value.id] = true
      db2.extend(db2, value.changes);
    })
    
    var conflictingKeys = underscore.union(underscore.keys(db1), underscore.keys(db2));
    
    var commit = new Commit();
    commit.parentIds = [branch1]
    commit.name = "merge";
    commit.properties = {};
    commit.changes = {};
    commit.sign()

    var continuation = function() {
      commit.parentIds = [branch1, branch2];
      
      this.database.adapter.saveCommit(commit, function() {
        callback();
      });
    }
    
    if(conflictingKeys.length != 0) {
      var conflicts = [];
      
      list2.forEach(function(commit) {
        if(!db1[commit]) {
          var matches = underscore.union(underscore.keys(commit.changes), conflictingKeys)
          if(matches.length != 0) {
            // Matches one of the conflicting keys
            var relatedCommits = [];
            list1.forEach(function(commit) {
              var overlap = underscore.union(underscore.keys(commit.changes), matches)
              if(overlap.length != 0) {
                relatedCommits.add(commit);
              }
            });
            
            var conflict = {}
            conflict.commit = commit;
            conflict.relatedCommits = relatedCommits;
            conflicts.push(conflict)
          }
        }
      })
      
      this.resolveConflict(conflicts, [branch1, branch2], commit, continuation);
    } else {
      continuation();
    }
    
    
    
  })
}


Database.prototype.push = function(remote) {
  // TODO
}

Database.prototype.pull = function(remote) {
  // TODO
}

Database.prototype.addRemote = function(name, remote) {
  this.remotes[name] = remote
}

Database.prototype.removeRemote = function(name) {
  delete this.remotes[name]
}

module.exports = Database
