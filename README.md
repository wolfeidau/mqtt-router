# mqtt-router [![Build Status](https://drone.io/github.com/wolfeidau/mqtt-router/status.png)](https://drone.io/github.com/wolfeidau/mqtt-router/latest)

This module a router for use with MQTT subscriptions.

[![NPM](https://nodei.co/npm/mqtt-router.png)](https://nodei.co/npm/mqtt-router/)
[![NPM](https://nodei.co/npm-dl/mqtt-router.png)](https://nodei.co/npm/mqtt-router/)

## Installation

```
npm install mqtt-router
```

# TLDR

If you have just started with [MQTT](https://github.com/adamvr/MQTT.js) the first thing you will notice is there is only callback registered for on Message,
even though you can register multiple subscriptions.. It is therefore up to you the developer to route these to the
correct handler, which is why I wrote this library.

I have added a simple override for the topic subscription to enable named params, really this is to avoid the
inevitable tokenising of the topic which I do every time I build complex topic structures.

*NOTE:* I will need to revisit this with some more validation, but for now it works for my simple requirements.


# usage

```javascript
var mqtt = require('mqtt')
  , mqttrouter = require('mqtt-router')
  , host = 'localhost'
  , port = '1883';

var settings = {
  keepalive: 1000,
  protocolId: 'MQIsdp',
  protocolVersion: 3,
  clientId: 'client-1'
};

// client connection
var client = mqtt.createClient(port, host, settings);

// enable the subscription router
var router = mqttrouter.wrap(client);

// subscribe to messages for 'hello/me'
router.subscribe('hello/me', function(topic, message){
  console.log('received', topic, message);
});

// subscribe to messages for 'hello/you'
router.subscribe('hello/you', function(topic, message){
  console.log('received', topic, message);
});

// subscribe to messages for 'some/+/you' with a named param for that token
router.subscribe('some/+:person/you', function(topic, message, params){
  console.log('received', topic, message);
});

```

## License
Copyright (c) 2013 Mark Wolfe
Licensed under the MIT license.
