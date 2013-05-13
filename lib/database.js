
var Commit = require('./commit')
var Branch = require('./branch')
var adapters = require('./adapters');

function Database(adapter, properties, callback) {
  if(!(adapter in adapters)) {
    throw new Error("Adapter " + adapter + " not found.")
  }
  
  this.adapter = new adapters[adapter](properties, callback);
  this.defaultRemote = null;
  this.remotes = {};
}

Database.prototype.currentBranch = function(callback) {
  var that = this;
  this.adapter.branches(function(branches) {
    if(branches.length == 0) {
      callback(new Branch(that, null));
    } else if(branches.length == 1) {
      callback(new Branch(that, branches[0]));
    } else {
      that.mergeBranches(branches, function() {
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
    console.log("Loading!")
    branch.load(keys, callback);
  });
}

Database.prototype.mergeBranches = function(branches, callback) {
  // TODO
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
