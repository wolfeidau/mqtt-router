'use strict';
/*
 * mqtt-router
 * https://github.com/wolfeidau/mqtt-router
 *
 * Copyright (c) 2013 Mark Wolfe
 * Licensed under the MIT license.
 */
var Houkou = require('houkou');
var log = require('debug')('mqtt-router:endpoint');

var Endpoint = function(topic, handler){
  log('endpoint', topic, handler);
  this.topic = topic;
  this.route = new Houkou(topic);
  this.handlers = [handler];

};

module.exports = Endpoint;
