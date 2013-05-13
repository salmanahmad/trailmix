
var TrailMix = require("../lib/trailmix")

var database = new TrailMix.Database("sqlite", {}, function() {
  database.save("initial", {}, {"hello": "World!"}, function() {
    console.log("saved!")
    
    database.load(["hello"], function(values) {
      console.log("Load returned this values: " + JSON.stringify(values));
    })
    
  })
})
