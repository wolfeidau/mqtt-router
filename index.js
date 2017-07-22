'use strict'

var Router = require('./lib/mqtt-router.js')

exports.wrap = function (mqttclient) {
  return new Router(mqttclient)
}
