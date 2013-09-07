# mqtt-router [![Build Status](https://travis-ci.org/wolfeidau/mqtt-router.png?branch=master)](https://travis-ci.org/wolfeidau/mqtt-router)

This module a router for use with MQTT subscriptions.

[![NPM](https://nodei.co/npm/mqtt-router.png)](https://nodei.co/npm/mqtt-router/)
[![NPM](https://nodei.co/npm-dl/mqtt-router.png)](https://nodei.co/npm/mqtt-router/)

## Installation

```
npm install mqtt-router
```

# usage

Exposes an array of functions which retrieves and returns data.

```javascript
var mqtt = require('mqtt');
var mqttrouter = require('mqtt-router');
var debug = require('debug')('mqtt:consumer');

var client = mqtt.createClient();

var router = mqttrouter.wrap(client);

router.subscribe('$RPC/time/request', function(topic, message){
  debug('received', topic, message);
});
```

*NOTE:* This currently just does simple subscriptions without wildcards, this is something I will work on next.

# TODO

* Work on wild cards using $ and # in the subscription.
* Look at using more of [houkou](https://github.com/deoxxa/houkou) to break up the the topic into params enabling more generic handlers.

## License
Copyright (c) 2013 Mark Wolfe
Licensed under the MIT license.