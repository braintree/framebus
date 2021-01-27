# Framebus [![Build Status](https://github.com/braintree/framebus/workflows/Unit%20Tests/badge.svg)](https://github.com/braintree/framebus/actions?query=workflow%3A%22Unit+Tests%22) [![Build Status](https://github.com/braintree/framebus/workflows/Functional%20Tests/badge.svg)](https://github.com/braintree/framebus/actions?query=workflow%3A%22Functional+Tests%22) [![npm version](https://badge.fury.io/js/framebus.svg)](http://badge.fury.io/js/framebus)

Framebus allows you to easily send messages across frames (and iframes) with a simple bus.

In one frame:

```js
var Framebus = require("framebus");
var bus = new Framebus();

bus.emit("message", {
  from: "Ron",
  contents: "they named it...San Diago",
});
```

In another frame:

```js
var Framebus = require("framebus");
var bus = new Framebus();

bus.on("message", function (data) {
  console.log(data.from + " said: " + data.contents);
});
```

The Framebus class takes a configuration object, where all the params are optional.

```js
type FramebusOptions = {
  origin?: string, // default: "*"
  channel?: string, // no default
  verifyDomain?: (url: string) => boolean, // no default
};
```

The `origin` sets the framebus instance to only operate on the chosen origin.

The `channel` namespaces the events called with `on` and `emit` so you can have multiple bus instances on the page and have them only communicate with busses with the same channel value.

If a `verifyDomain` is passed, then the `on` listener will only fire if the domain of the origin of the post message matches the `location.href` value of page or the function passed for `verifyDomain` returns `true`.

```js
var bus = new Framebus({
  verifyDomain: function (url) {
    // only return true if the domain of the url matches exactly
    url.indexOf("https://my-domain") === 0;
  },
});
```

## API

#### `target(options: FramebusOptions): framebus`

**returns**: a chainable instance of framebus that operates on the chosen origin.

This method is used in conjuction with `emit`, `on`, and `off` to restrict their results to the given origin. By default, an origin of `'*'` is used.

```javascript
framebus
  .target({
    origin: "https://example.com",
  })
  .on("my cool event", function () {});
// will ignore all incoming 'my cool event' NOT from 'https://example.com'
```

| Argument  | Type            | Description                        |
| --------- | --------------- | ---------------------------------- |
| `options` | FramebusOptions | See above section for more details |

#### `emit('event', data?, callback?): boolean`

**returns**: `true` if the event was successfully published, `false` otherwise

| Argument         | Type     | Description                                          |
| ---------------- | -------- | ---------------------------------------------------- |
| `event`          | String   | The name of the event                                |
| `data`           | Object   | The data to give to subscribers                      |
| `callback(data)` | Function | Give subscribers a function for easy, direct replies |

#### `emitAsPromise('event', data?): Promise`

**returns**: A promise that resolves when the emitted event is responded to the first time. It will reject if the event could not be succesfully published.

| Argument | Type   | Description                     |
| -------- | ------ | ------------------------------- |
| `event`  | String | The name of the event           |
| `data`   | Object | The data to give to subscribers |

Using this method assumes the browser context you are using supports Promises. If it does not, set a polyfill for the Framebus class with `setPromise`

```js
// or however you want to polyfill the promise
const PolyfilledPromise = require("promise-polyfill");

Framebus.setPromise(PolyfilledPromise);
```

#### `on('event', fn): boolean`

**returns**: `true` if the subscriber was successfully added, `false` otherwise

Unless already bound to a scope, the listener will be executed with `this` set
to the `MessageEvent` received over postMessage.

| Argument               | Type     | Description                                                 |
| ---------------------- | -------- | ----------------------------------------------------------- |
| `event`                | String   | The name of the event                                       |
| `fn(data?, callback?)` | Function | Event handler. Arguments are from the `emit` invocation     |
| ↳ `this`               | scope    | The `MessageEvent` object from the underlying `postMessage` |

#### `off('event', fn): boolean`

**returns**: `true` if the subscriber was successfully removed, `false` otherwise

| Argument | Type     | Description                      |
| -------- | -------- | -------------------------------- |
| `event`  | String   | The name of the event            |
| `fn`     | Function | The function that was subscribed |

#### `include(popup): boolean`

**returns**: `true` if the popup was successfully included, `false` otherwise

```javascript
var popup = window.open("https://example.com");

framebus.include(popup);
framebus.emit("hello popup and friends!");
```

| Argument | Type   | Description                                  |
| -------- | ------ | -------------------------------------------- |
| `popup`  | Window | The popup refrence returned by `window.open` |

#### `teardown(): void`

Calls `off` on all listeners used for this bus instance and makes subsequent calls to all methods `noop`.

```javascript
bus.on("event-name", handler);

// event-name listener is torn down
bus.teardown();

// these now do nothing
bus.on("event-name", handler);
bus.emit("event-name", data);
bus.off("event-name", handler);
```

## Pitfalls

These are some things to keep in mind while using **framebus** to handle your
event delegation

### Cross-site scripting (XSS)

**framebus** allows convenient event delegation across iframe borders. By
default it will broadcast events to all iframes on the page, regardless of
origin. Use the optional `target()` method when you know the exact domain of
the iframes you are communicating with. This will protect your event data from
malicious domains.

### Data is serialized as JSON

**framebus** operates over `postMessage` using `JSON.parse` and `JSON.stringify`
to facilitate message data passing. Keep in mind that not all JavaScript objects
serialize cleanly into and out of JSON, such as `undefined`.

### Asynchronicity

Even when the subscriber and publisher are within the same frame, events go
through `postMessage`. Keep in mind that `postMessage` is an asynchronous
protocol and that publication and subscription handling occur on separate
iterations of the [event
loop (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/EventLoop#Event_loop).

### Published callback functions are an abstraction

When you specify a `callback` while using `emit`, the function is not actually
given to the subscriber. The subscriber receives a one-time-use function that is
generated locally by the subscriber's **framebus**. This one-time-use callback function
is pre-configured to publish an event back to the event origin's domain using a
[UUID](http://tools.ietf.org/html/rfc4122) as the event name. The events occur
as follows:

1. `http://emitter.example.com` publishes an event with a function as the event data

   ```javascript
   var callback = function (data) {
     console.log("Got back %s as a reply!", data);
   };

   framebus.emit("Marco!", callback, "http://listener.example.com");
   ```

1. The **framebus** on `http://emitter.example.com` generates a UUID as an event name
   and adds the `callback` as a subscriber to this event.
1. The **framebus** on `http://listener.example.com` sees that a special callback
   event is in the event payload. A one-time-use function is created locally and
   given to subscribers of `'Marco!'` as the event data.
1. The subscriber on `http://listener.example.com` uses the local one-time-use
   callback function to send data back to the emitter's origin

   ```javascript
   framebus
     .target("http://emitter.example.com")
     .on("Marco!", function (callback) {
       callback("Polo!");
     });
   ```

1. The one-time-use function on `http://listener.example.com` publishes an event
   as the UUID generated in **step 2** to the origin that emitted the event.
1. Back on `http://emitter.example.com`, the `callback` is called and
   unsubscribed from the special UUID event afterward.

## Development and contributing

See [**CONTRIBUTING.md**](CONTRIBUTING.md)
