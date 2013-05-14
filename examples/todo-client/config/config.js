
var settings = require("./settings")

exports.development = {
  port: 4000,
  cookieSecret: settings.cookieSecret
}

exports.production = {
  port: 4000,
  cookieSecret: settings.cookieSecret
}
