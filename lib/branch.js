
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

Branch.prototype.commit = function(name, properties) {
  this.stage.parentIds = [this.head.id];
  this.stage.name = name;
  this.stage.properties = properties;
  this.stage.sign();
  
  this.database.adapter.saveCommit(this.stage);
  
  this.head = this.stage;
  this.reset();
  
  this.database.mergeBranches();
}

Branch.prototype.save = function(name, properties, changes) {
  this.reset();
  
  for(var key in changes) {
    var value = changes[key];
    this.set(key, value);
  }
  
  this.commit(name, properties);
}

Branch.prototype.load = function(keys) {
  this.database.adapter.load(keys, this.head.id);
}

