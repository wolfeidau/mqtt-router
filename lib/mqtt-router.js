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
  this.route = route ? new Houkou(route, requirements(route)) : new Houkou(topic);
  this.handlers = [handler];

  function requirements(route){

    var params = topic.match(/\:[a-zA-Z0-9]+/g);

    if(!params) {
      return null;
    }

    var obj = {requirements: {}};

    params.forEach(function(param){
      requirements.requirements[param] = "[a-zA-Z0-9_\-]+";
    });
    log('requirements', obj);

    return obj;

  }
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
   * @param topic - MQTT topic with named params
   * @param handler - Handler function
   */
  this.subscribe = function (topic, handler) {

    var safeTopic = this._stripParams(topic);

    // clean out the MQTT wild card options
    var routeOption = topic.replace(/\$/, "\\$").replace(/\+/, "").replace(/#/, "");

    var endpoint = self._endpointMatches(safeTopic)[0];

    if (endpoint) {
      endpoint.handlers.push(handler);
    } else {
      self.endpoints.push(new Endpoint(safeTopic, routeOption, handler));
    }
    log('subscribe', safeTopic);
    log('subscribe', 'route', routeOption);
    this.mqttclient.subscribe(safeTopic);

  };

  this._stripParams = function (topic) {
    var safeTopic = topic.replace(/\$/, "\\$");
    safeTopic = topic.replace(/\:[a-zA-Z0-9]+/g, "");
    return safeTopic;
  };

  this._endpointMatches = function (topic) {
    return this.endpoints.map(function (endpoint) {
      return endpoint.topic === topic ? endpoint : null;
    });
  };

};

module.exports = Router;
