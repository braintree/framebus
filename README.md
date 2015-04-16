Framebus
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

#### `publish('event', (data or callback) [, toOrigin]): boolean`
__aliases__: `pub`, `trigger`, `emit`

__returns__: `true` if the event was successfully published, `false` otherwise

| Argument         | Type     | Description                                          |
| ---------------- | -------- | ---------------------------------------------------- |
| `event`        | String   | The name of the event                                |
| `data`           | any      | The data to give to subscribers                      |
| `callback(data)` | Function | Give subscribers a function for easy, direct replies |
| `toOrigin`       | String   | (default: `'*'`) only target frames with this origin |

#### `subscribe('event', fn [, fromOrigin]): boolean`
__alises__: `sub`, `on`

__returns__: `true` if the subscriber was successfully added, `false` otherwise

| Argument                       | Type     | Description                                                 |
| ------------------------------ | -------- | ----------------------------------------------------------- |
| `event`                      | String   | The name of the event                                       |
| `fn(data or callback, origin)` | Function | Event handler                                               |
| `↳ data`                       | any      | The data that was published with the event                  |
| `↳ callback(data)`             | Function | A callback for sending data directly back to the emitter    |
| `↳ origin`                     | String   | The origin address that originated the event                |
| `fromOrigin`                   | String   | (default: `'*'`) only subscribe to events from this origin  |

#### `unsubscribe('event', fn [, fromOrigin]): boolean`
__aliases__: `unsub`, `off`

__returns__: `true` if the subscriber was successfully removed, `false` otherwise

| Argument     | Type     | Description                                          |
| ------------ | -------- | ---------------------------------------------------- |
| `event`    | String   | The name of the event                                |
| `fn`         | Function | The function that was subscribed                     |
| `fromOrigin` | String   | The origin, if given during `subscribe`              |

## Pitfalls

These are some things to keep in mind while using __framebus__ to handle your
event delegation

### Cross-site scripting (XSS)

__framebus__ allows convenient event delegation across iframe borders. By
default it will broadcast events to all iframes on the page, regardless of
origin. Use the optional `origin` parameter when you know the exact domain of
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
    framebus.on('Marco!', function (callback) {
         callback('Polo!');
     }, 'http://emitter.example.com')
    ```

1. The one-time-use function on `http://listener.example.com` publishes an event
   as the UUID generated in __step 2__ to the origin that emitted the event.
1. Back on `http://emitter.example.com`, the `callback` is called and
   unsubscribed from the special UUID event afterward.

## Development and contributing

See [__CONTRIBUTING.md__](CONTRIBUTING.md)
