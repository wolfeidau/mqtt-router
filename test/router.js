'use strict';

var chai = require('chai');
var sinon = require('sinon');
var mqtt = require('mqtt');
var log = require('debug')('test:mqtt-router');
var expect = chai.expect;
var mqttrouter = require('../index.js');

describe('client', function () {

  it('should route one message to the handler', function (done) {

    var mqttclient = mqtt.createClient();

    var firstTopic = 'TEST/localtime/request';
    var secondTopic = 'TEST/localtime/reply';

    function check() {
      expect(callback.calledOnce).to.be.true;
      expect(callback.getCall(0).args[0]).to.equal(firstTopic);
      done();
    }

    var callback = sinon.spy(function (topic, message) {
      log('msg', topic, message);
      check();
    });

    var router = mqttrouter.wrap(mqttclient);
    router.subscribe(firstTopic, callback);

    log('publish', firstTopic);
    mqttclient.publish(firstTopic, 'hello firstTopic!');

    log('publish', secondTopic);
    mqttclient.publish(secondTopic, 'hello secondTopic!');

  });

  it('should route one message to wild card handler', function (done) {

    var mqttclient = mqtt.createClient();

    var firstTopic = 'TEST/beertime/request';
    var secondTopic = 'TEST/remotetime/reply';

    function check() {
      expect(callback.calledOnce).to.be.true;
      expect(callback.getCall(0).args[0]).to.equal(firstTopic);
      done();
    }

    var callback = sinon.spy(function (topic, message, params) {
      log('msg', topic, message, params);
      check();
    });

    var router = mqttrouter.wrap(mqttclient);
    router.subscribe('TEST/beertime/#:type', callback);

    log('publish', firstTopic);
    mqttclient.publish(firstTopic, 'hello firstTopic!');

    log('publish', secondTopic);
    mqttclient.publish(secondTopic, 'hello secondTopic!');

  });

  it('should route one message to wild card handler with two params', function (done) {

    var mqttclient = mqtt.createClient();

    var firstTopic = 'TEST/greentime/request/1';
    var secondTopic = 'TEST/sometime/reply';

    function check() {
      expect(callback.calledOnce).to.be.true;
      expect(callback.getCall(0).args[0]).to.equal(firstTopic);
      expect(callback.getCall(0).args[2].type).to.equal('request');
      expect(callback.getCall(0).args[2].no).to.equal('1');
      done();
    }

    var callback = sinon.spy(function (topic, message, params) {
      log('msg', topic, message, params);
      check();
    });

    var router = mqttrouter.wrap(mqttclient);
    router.subscribe('TEST/greentime/+:type/+:no', callback);

    log('publish', firstTopic);
    mqttclient.publish(firstTopic, 'hello firstTopic!');

    log('publish', secondTopic);
    mqttclient.publish(secondTopic, 'hello secondTopic!');

  });

  it('should route one message to single level wild card', function (done) {

    var mqttclient = mqtt.createClient();

    var firstTopic = 'TEST/winetime/request';
    var secondTopic = 'TEST/whiskeytime/reply';

    function check() {
      expect(callback.calledOnce).to.be.true;
      expect(callback.getCall(0).args[0]).to.equal(firstTopic);
      done();
    }

    var callback = sinon.spy(function (topic, message, params) {
      log('msg', topic, message, params);
      check();
    });

    var router = mqttrouter.wrap(mqttclient);
    router.subscribe('TEST/+:time/request', callback);

    log('publish', firstTopic);
    mqttclient.publish(firstTopic, 'hello firstTopic!');

    log('publish', secondTopic);
    mqttclient.publish(secondTopic, 'hello secondTopic!');

  });


});
