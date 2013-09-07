'use strict';
var mqtt = require('mqtt');
var mqttrouter = require('../index.js');

var client = mqtt.createClient();
var router = mqttrouter.wrap(client);

router.subscribe('$TEST/dev/request', function(topic, message){
  console.log('request handler', topic, message);
});

router.subscribe('$TEST/dev/reply', function(topic, message){
  console.log('reply handler', topic, message);
});

client.publish('$TEST/dev/reply', 'hello me!');
client.publish('$TEST/dev/request', 'hello me!');
