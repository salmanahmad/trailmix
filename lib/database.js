
var Commit = require('./commit')
var adapters = require('./adapters');

function Database(adapter, properties) {
  if(!(adapter in adapters)) {
    throw new Error("Adapter " + adapter + " not found.")
  }
  
  this.adapter = new adapters[adapter](properties);
  this.defaultRemote = null;
  this.remotes = {};
}

Database.prototype.currentBranch = function() {
  var branches = this.adapter.branches();
  if(branches.length == 1) {
    return branches[0]
  } else {
    this.mergeBranches(branches);
    return this.currentBranch();
  }
}

Database.prototype.save = function(name, properties, changes) {
  var branch = this.currentBranch();
  return branch.save(name, properties, changes);
}

Database.prototype.load = function(keys) {
  var branch = this.currentBranch();
  return branch.load(keys);
}

Database.prototype.mergeBranches = function(branches) {
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
