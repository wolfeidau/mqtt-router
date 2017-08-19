'use strict'
/* global describe, it, beforeEach, afterEach */

var chai = require('chai')
var sinon = require('sinon')
var mqtt = require('mqtt')
var log = require('debug')('test:mqtt-router')
var should = chai.should() // eslint-disable-line
var mqttrouter = require('../index.js')
var mosca = require('mosca')

describe('router', function () {
  var mqttBroker
  beforeEach(() => {
    mqttBroker = new mosca.Server({
      persistence: {
        factory: mosca.persistence.Memory
      }
    })
  })

  afterEach(() => {
    mqttBroker.close()
  })
  it('should route one message to the handler', function (done) {
    var mqttclient = mqtt.connect(`mqtt://localhost:${mqttBroker.opts.port}`)
    var router = mqttrouter.wrap(mqttclient)

    var firstTopic = 'TEST/localtime/request'
    var secondTopic = 'TEST/localtime/reply'

    function check () {
      callback.calledOnce.should.equal(true)
      callback.getCall(0).args[0].should.equal(firstTopic)
      router.reset()
      done()
    }

    var callback = sinon.spy(function (topic, message) {
      log('msg', topic, message)
      check()
    })
    router.subscribe(firstTopic, callback)
    log('publish', firstTopic)
    mqttclient.publish(firstTopic, 'hello firstTopic!')

    log('publish', secondTopic)
    mqttclient.publish(secondTopic, 'hello secondTopic!')
  })

  it('should route only one message to the handler (unsubscribe)', function (done) {
    var mqttclient = mqtt.connect(`mqtt://localhost:${mqttBroker.opts.port}`)
    var router = mqttrouter.wrap(mqttclient)

    var firstTopic = 'TEST/localtime/unsubscribe'

    function check () {
      callback.calledOnce.should.equal(true)
      callback.getCall(0).args[0].should.equal(firstTopic)
      done()
    }

    var callback = sinon.spy(function (topic, message) {
      log('msg', topic, message)
      router.unsubscribe(firstTopic, callback)
      router.subscribe(firstTopic, check)
      log('publish', firstTopic)
      mqttclient.publish(firstTopic, 'hello firstTopic!')
    })
    router.subscribe(firstTopic, callback)
    log('publish', firstTopic)
    mqttclient.publish(firstTopic, 'hello firstTopic!')
  })

  it('should route one message to wild card handler', function (done) {
    var mqttclient = mqtt.connect(`mqtt://localhost:${mqttBroker.opts.port}`)
    var router = mqttrouter.wrap(mqttclient)

    var firstTopic = 'TEST/beertime/request'
    var secondTopic = 'TEST/remotetime/reply'

    function check () {
      callback.calledOnce.should.equal(true)
      callback.getCall(0).args[0].should.equal(firstTopic)
      router.reset()
      done()
    }

    var callback = sinon.spy(function (topic, message, params) {
      log('msg', topic, message, params)
      check()
    })

    router.subscribe('TEST/beertime/#:type', callback)

    log('publish', firstTopic)
    mqttclient.publish(firstTopic, 'hello firstTopic!')

    log('publish', secondTopic)
    mqttclient.publish(secondTopic, 'hello secondTopic!')
  })

  it('should route one message to wild card handler with two params', function (done) {
    var mqttclient = mqtt.connect(`mqtt://localhost:${mqttBroker.opts.port}`)
    var router = mqttrouter.wrap(mqttclient)

    var firstTopic = '$TEST/greentime/request/1'
    var secondTopic = '$TEST/sometime/reply'

    function check () {
      callback.calledOnce.should.equal(true)
      callback.getCall(0).args[0].should.equal(firstTopic)
      callback.getCall(0).args[2].type.should.equal('request')
      callback.getCall(0).args[2].no.should.equal('1')
      router.reset()
      done()
    }

    var callback = sinon.spy(function (topic, message, params) {
      log('msg', topic, message, params)
      check()
    })

    router.subscribe('$TEST/greentime/+:type/+:no', callback)

    log('publish', firstTopic)
    mqttclient.publish(firstTopic, 'hello firstTopic!')

    log('publish', secondTopic)
    mqttclient.publish(secondTopic, 'hello secondTopic!')
  })

  it('should route one message to single level wild card', function (done) {
    var mqttclient = mqtt.connect(`mqtt://localhost:${mqttBroker.opts.port}`)
    var router = mqttrouter.wrap(mqttclient)

    var firstTopic = 'TEST/winetime/request'
    var secondTopic = 'TEST/whiskeytime/reply'

    function check () {
      callback.calledOnce.should.equal(true)
      callback.getCall(0).args[0].should.equal(firstTopic)
      router.reset()
      done()
    }

    var callback = sinon.spy(function (topic, message, params) {
      log('msg', topic, message, params)
      check()
    })

    router.subscribe('TEST/+:time/request', callback)

    log('publish', firstTopic)
    mqttclient.publish(firstTopic, 'hello firstTopic!')

    log('publish', secondTopic)
    mqttclient.publish(secondTopic, 'hello secondTopic!')
  })

  it('should route one message to the handler with $ in topic name', function (done) {
    var mqttclient = mqtt.connect(`mqtt://localhost:${mqttBroker.opts.port}`)
    var router = mqttrouter.wrap(mqttclient)

    var firstTopic = '$TEST/localtime/request'
    var secondTopic = '$TEST/localtime/reply'

    function check () {
      callback.calledOnce.should.equal(true)
      callback.getCall(0).args[0].should.equal(firstTopic)
      router.reset()
      done()
    }

    var callback = sinon.spy(function (topic, message) {
      log('msg', topic, message)
      check()
    })

    router.subscribe(firstTopic, callback)

    log('publish', firstTopic)
    mqttclient.publish(firstTopic, 'hello firstTopic!')

    log('publish', secondTopic)
    mqttclient.publish(secondTopic, 'hello secondTopic!')
  })
})
