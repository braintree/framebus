Framebus [![Build Status](https://travis-ci.org/braintree/framebus.svg)](https://travis-ci.org/braintree/framebus) [![npm version](https://badge.fury.io/js/framebus.svg)](http://badge.fury.io/js/framebus)
========


Framebus allows you to easily send messages across frames (and iframes) with a simple bus.

In one frame:

```js
var bus = require('framebus');

bus.emit('message', {
  from: 'Ron',
  contents: 'they named it...San Diago'
});
```

In another frame:

```js
var bus = require('framebus');

bus.on('message', function (data) {
  console.log(data.from + ' said: ' + data.contents);
});
```

## API

#### `target(origin): framebus`

__returns__: a chainable instance of framebus that operates on the chosen origin.

This method is used in conjuction with `publish`, `subscribe`, and `unsubscribe` to restrict their results to the given origin. By default, an origin of `'*'` is used.

```javascript
framebus.target('https://example.com').on('my cool event', function () {});
// will ignore all incoming 'my cool event' NOT from 'https://example.com'
```

| Argument         | Type     | Description                                          |
| ---------------- | -------- | ---------------------------------------------------- |
| `origin`         | String   | (default: `'*'`) only target frames with this origin |

#### `publish('event' [, arg...] [, callback]): boolean`
__aliases__: `pub`, `trigger`, `emit`

__returns__: `true` if the event was successfully published, `false` otherwise

| Argument         | Type     | Description                                          |
| ---------------- | -------- | ---------------------------------------------------- |
| `event`          | String   | The name of the event                                |
| `arg`            | any      | The data to give to subscribers                      |
| `callback(data)` | Function | Give subscribers a function for easy, direct replies |

#### `subscribe('event', fn): boolean`
__alises__: `sub`, `on`

__returns__: `true` if the subscriber was successfully added, `false` otherwise

Unless already bound to a scope, the listener will be executed with `this` set
to the `MessageEvent` received over postMessage.

| Argument                       | Type     | Description                                                 |
| ------------------------------ | -------- | ----------------------------------------------------------- |
| `event`                        | String   | The name of the event                                       |
| `fn([arg...] [, callback])`    | Function | Event handler. Arguments are from the `publish` invocation  |
| ↳ `this`                       | scope    | The `MessageEvent` object from the underlying `postMessage` |

#### `unsubscribe('event', fn): boolean`
__aliases__: `unsub`, `off`

__returns__: `true` if the subscriber was successfully removed, `false` otherwise

| Argument     | Type     | Description                                          |
| ------------ | -------- | ---------------------------------------------------- |
| `event`      | String   | The name of the event                                |
| `fn`         | Function | The function that was subscribed                     |

#### `include(popup): boolean`

__returns__: `true` if the popup was successfully included, `false` otherwise

```javascript
var popup = window.open('https://example.com');

framebus.include(popup);
framebus.emit('hello popup and friends!');
```

| Argument     | Type     | Description                                          |
| ------------ | -------- | ---------------------------------------------------- |
| `popup`      | Window   | The popup refrence returned by `window.open`         |

## Pitfalls

These are some things to keep in mind while using __framebus__ to handle your
event delegation

### Cross-site scripting (XSS)

__framebus__ allows convenient event delegation across iframe borders. By
default it will broadcast events to all iframes on the page, regardless of
origin. Use the optional `target()` method when you know the exact domain of
the iframes you are communicating with. This will protect your event data from
malicious domains.

### Data is serialized as JSON

__framebus__ operates over `postMessage` using `JSON.parse` and `JSON.stringify`
to facilitate message data passing. Keep in mind that not all JavaScript objects
serialize cleanly into and out of JSON, such as `undefined`.

### Asynchronicity

Even when the subscriber and publisher are within the same frame, events go
through `postMessage`. Keep in mind that `postMessage` is an asynchronous
protocol and that publication and subscription handling occur on separate
iterations of the [event
loop (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/EventLoop#Event_loop).

### Published callback functions are an abstraction

When you specify a `callback` while using `publish`, the function is not actually
given to the subscriber. The subscriber receives a one-time-use function that is
generated locally by the subscriber's __framebus__. This one-time-use callback function
is pre-configured to publish an event back to the event origin's domain using a
[UUID](http://tools.ietf.org/html/rfc4122) as the event name. The events occur
as follows:

1. `http://emitter.example.com` publishes an event with a function as the event data

    ```javascript
    var callback = function (data) {
        console.log('Got back %s as a reply!', data)
    }

    framebus.publish('Marco!', callback, 'http://listener.example.com');
    ```

1. The __framebus__ on `http://emitter.example.com` generates a UUID as an event name
   and adds the `callback` as a subscriber to this event.
1. The __framebus__ on `http://listener.example.com` sees that a special callback
   event is in the event payload. A one-time-use function is created locally and
   given to subscribers of `'Marco!'` as the event data.
1. The subscriber on `http://listener.example.com` uses the local one-time-use
   callback function to send data back to the emitter's origin

    ```javascript
    framebus.target('http://emitter.example.com')
      .on('Marco!', function (callback) {
         callback('Polo!');
      });
    ```

1. The one-time-use function on `http://listener.example.com` publishes an event
   as the UUID generated in __step 2__ to the origin that emitted the event.
1. Back on `http://emitter.example.com`, the `callback` is called and
   unsubscribed from the special UUID event afterward.

## Development and contributing

See [__CONTRIBUTING.md__](CONTRIBUTING.md)
