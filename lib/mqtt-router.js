'use strict';
/*
 * mqtt-router
 * https://github.com/wolfeidau/mqtt-router
 *
 * Copyright (c) 2013 Mark Wolfe
 * Licensed under the MIT license.
 */
var mqtt = require('mqtt');
var Houkou = require('houkou');
var log = require('debug')('mqtt-router:router');

var Endpoint = function (topic, route, handler) {
  log('endpoint', topic);
  this.topic = topic;
  this.route = route ? new Houkou(route) : new Houkou(topic);
  this.handlers = [handler];
};

var Router = function (mqttclient) {

  this.mqttclient = mqttclient || mqtt.createClient();

  this.endpoints = [];

  var self = this;

  this.mqttclient.on('message', function (topic, message) {
    log('message', topic, message);

    self.endpoints.forEach(function (endpoint) {
      log('endpoint', endpoint.topic);
      var params = endpoint.route.match(topic);
      if (params) {
        endpoint.handlers.forEach(function (handler) {
          handler(topic, message, params);
        });
      }
    });

  });

  /**
   * Subscribe to a topic using an optional route to break up the topic.
   *
   * @param topic - MQTT topic
   * @param route - Optional topic matcher
   * @param handler - Handler function
   */
  this.subscribe = function (topic, route, handler) {

    var safeTopic = topic.replace(/\$/, "\\$");
    var topicHandler = typeof route === 'function' ? route : handler;
    var routeOption = typeof route === 'function' ? null : route.replace(/\$/, "\\$");

    log('subscribe', 'topicHandler', topicHandler);
    log('subscribe', 'routeOption', routeOption);
    log('endpoint', safeTopic);

    var endpoint = self._endpointMatches(safeTopic)[0];

    if (endpoint) {
      endpoint.handlers.push(topicHandler);
    } else {
      self.endpoints.push(new Endpoint(safeTopic, routeOption, topicHandler));
    }
    log('subscribe', topic);
    this.mqttclient.subscribe(topic);

  };

  this._endpointMatches = function (topic) {
    return this.endpoints.map(function (endpoint) {
      return endpoint.topic === topic ? endpoint : null;
    });
  };

};

module.exports = Router;
