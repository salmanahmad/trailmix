
var crypto = require('crypto');

function Commit() {
  this.id = null;
  this.parentIds = [];
  this.name = '';
  this.properties = {};
  this.changes = {};
}

Commit.prototype.sign = function() {
  this.id = null;
  
  var sha = crypto.createHash('sha1');
  var json = JSON.stringify(this) + (new Date().getTime()) + Math.random();
  sha.update(json);
  
  this.id = sha.digest('hex');
}

module.exports = Commit;
