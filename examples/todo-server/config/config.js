
var settings = require("./settings")

exports.development = {
  port: 3000,
  cookieSecret: settings.cookieSecret
}

exports.production = {
  port: 3000,
  cookieSecret: settings.cookieSecret
}
