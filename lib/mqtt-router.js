'use strict'
/*
 * mqtt-router
 * https://github.com/wolfeidau/mqtt-router
 *
 * Copyright (c) 2013 Mark Wolfe
 * Licensed under the MIT license.
 */
var mqtt = require('mqtt')
var Houkou = require('houkou')
var log = require('debug')('mqtt-router:router')

/**
 * Holds the state of a subscription to a given topic path.
 *
 * @param topic
 * @param route
 * @param handler
 * @param opts
 * @constructor
 */
var Endpoint = function (topic, route, handler, opts) {
  log('endpoint', topic)
  this.topic = topic
  this.route = route ? new Houkou(route, requirements(route)) : new Houkou(topic)
  this.handlers = [handler]
  this.opts = opts

  function requirements (route) {
    var params = route.match(/:[a-zA-Z0-9]+/g)

    if (!params) {
      return null
    }

    var obj = {requirements: {}}

    params.forEach(function (param) {
      obj.requirements[param.replace(':', '')] = '[a-zA-Z0-9_-]+'
    })
    log('requirements', obj)

    return obj
  }

  this.reset = function reset () {
    this.handlers = []
  }
}

/**
 * Wraps the MQTT client and provides a router of sorts for handling which callbacks are invoked when a message is
 * received over MQTT.
 *
 * @param mqttclient
 * @constructor
 */
var Router = function (mqttclient) {
  this.mqttclient = mqttclient || mqtt.connect()
  this.endpoints = []

  var self = this

  this.mqttclient.on('message', function (topic, message) {
    log('message', topic, message)

    self.endpoints.forEach(function (endpoint) {
      log('endpoint', endpoint.topic)
      var params = endpoint.route.match(topic)
      if (params) {
        endpoint.handlers.forEach(function (handler) {
          handler(topic, message, params)
        })
      }
    })
  })

  /**
   * Returns whether or not the underlying MQTT connection is up.
   *
   * @returns {boolean|*}
   */
  this.isConnected = function () {
    return self.mqttclient.connected
  }

  this.mqttclient.on('connect', function () {
    log('connect', self.mqttclient.connected)

    // one thing to note here is subscription operations are idempotent, so no need for fancy checking.
    self.endpoints.forEach(function (endpoint) {
      log('connect', 'subscribe', endpoint.topic, endpoint.opts)
      self.mqttclient.subscribe(endpoint.topic, endpoint.opts)
    })
  })

  this.mqttclient.on('close', function (err) {
    log('close', self.mqttclient.connected, err)
  })

  /**
   * Subscribe to a topic using an optional route to break up the topic.
   *
   * @param topic - MQTT topic with named params
   * @param opts - Options which are passed to the MQTT client subscribe call
   * @param handler - Handler function
   */
  this.subscribe = function (topic, opts, handler) {
    // .subscribe('topic', handler)
    if (typeof opts === 'function') {
      handler = opts
      opts = null
    }

    var safeTopic = this._stripParams(topic)

    // clean out the MQTT wild card options
    var routeOption = topic.replace(/\$/, '\\$').replace(/\+/, '').replace(/#/, '')

    var endpoint = self._endpointMatches(safeTopic)[0]

    if (endpoint) {
      endpoint.handlers.push(handler)
    } else {
      self.endpoints.push(new Endpoint(safeTopic, routeOption, handler, opts))
    }
    log('subscribe', safeTopic)
    log('subscribe', 'route', routeOption)
    this.mqttclient.subscribe(safeTopic, opts)
  }

  this.reset = function reset () {
    log('reset', this.endpoints)
    // clear out all the handlers
    this.endpoints.forEach(function resetEndpoint (endpoint) {
      endpoint.reset()
    })
    this.endpoints = []
  }

  this._stripParams = function (topic) {
    var safeTopic = topic.replace(/\$/, '\\$')
    safeTopic = topic.replace(/:[a-zA-Z0-9]+/g, '')
    return safeTopic
  }

  this._endpointMatches = function (topic) {
    return this.endpoints.map(function (endpoint) {
      return endpoint.topic === topic ? endpoint : null
    })
  }
}

module.exports = Router
