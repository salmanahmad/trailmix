
var TrailMix = require("../lib/trailmix");
var SQLiteAdapter = require("../lib/adapters/sqlite-adapter");

var adapter = new SQLiteAdapter({}, function() {
  
  var database = new TrailMix.Database(adapter)
  
  database.save("initial", {}, {"hello": "World!"}, function() {
    console.log("saved!")
  
    database.load(["hello"], function(values) {
      console.log("Load returned this values: " + JSON.stringify(values));
    })
  
  })
})

