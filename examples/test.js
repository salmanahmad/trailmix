
var TrailMix = require("../lib/trailmix")

var database = new TrailMix.Database("sqlite")

database.save("edit", {}, {
  a: "o"
})