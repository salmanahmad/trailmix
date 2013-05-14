
var Commit = require('./commit')
var Branch = require('./branch')
//var adapters = require('./adapters');

var underscore = require('underscore')

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
    console.log(conflicts)
    callback();
  });
}

Database.prototype.conflict = function(callback) {
  this.resolveConflict = callback;
}

Database.prototype.delete = function(callback) {
  this.adapter.delete(function() {
    if(underscore.isFunction(callback)) callback()
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
    if(branch) {
      branch.load(keys, callback);
    }
  });
}

Database.prototype.mergeBranches = function(branch1, branch2, callback) {
  var branches = [branch1, branch2].sort();
  var branch1 = branches[0];
  var branch2 = branches[1];
  
  var that = this;
  this.adapter.commonBase(branch1.id, branch2.id, function(base, list1, list2) {
    var db1 = {};
    var db2 = {};
    
    var commitMap1 = {};
    var commitMap2 = {};
    
    list1.forEach(function(value) {
      commitMap1[value.id] = true;
      db1 = underscore.extend(db1, value.changes);
    })
    
    list2.forEach(function(value) {
      commitMap2[value.id] = true
      db2 = underscore.extend(db2, value.changes);
    })
    
    console.log("Lists")
    console.log(list1)
    console.log(list2)
    
    console.log(db1)
    console.log(db2)
    
    var conflictingKeys = underscore.intersection(underscore.keys(db1), underscore.keys(db2));
    
    console.log("Conflicting Keys!")
    console.log(conflictingKeys)
    
    var commit = new Commit();
    commit.parentIds = [branch1]
    commit.name = "merge";
    commit.properties = {};
    commit.changes = {};
    
    var continuation = function() {
      commit.parentIds = [branch1.id, branch2.id];
      
      commit.sign()
      that.adapter.saveCommit(commit, function() {
        callback();
      });
    }
    
    if(conflictingKeys.length != 0) {
      var conflicts = [];
      
      list2.forEach(function(commit) {
        if(!db1[commit]) {
          var matches = underscore.intersection(underscore.keys(commit.changes), conflictingKeys)
          if(matches.length != 0) {
            // Matches one of the conflicting keys
            var relatedCommits = [];
            list1.forEach(function(commit) {
              var overlap = underscore.intersection(underscore.keys(commit.changes), matches)
              if(overlap.length != 0) {
                relatedCommits.push(commit);
              }
            });
            
            var conflict = {}
            conflict.commit = commit;
            conflict.relatedCommits = relatedCommits;
            conflicts.push(conflict)
          }
        }
      })
      commit.changes = branch1.changes
      that.resolveConflict(conflicts, [branch1, branch2], commit, continuation);
    } else {
      continuation();
    }
    
    
    
  })
}


Database.prototype.push = function(remote, callback) {
  var that = this;
  that.adapter.commits(function(commits) {
    var data = JSON.stringify(commits)
    $.post(that.remotes[remote] + "/commits", {commits: data}, function() {
      if(underscore.isFunction(callback)) callback();
    })
  })
}

Database.prototype.pull = function(remote, callback) {
  var that = this;
  $.get(this.remotes[remote] + "/commits", function(data) {
    var commits = JSON.parse(data);
    that.adapter.mergeCommits(commits, function() {
      if(underscore.isFunction(callback)) callback();
    })
  })
}

Database.prototype.addRemote = function(name, remote) {
  this.remotes[name] = remote
}

Database.prototype.removeRemote = function(name) {
  delete this.remotes[name]
}

module.exports = Database
