# Framebus [![Build Status](https://github.com/braintree/framebus/workflows/Unit%20Tests/badge.svg)](https://github.com/braintree/framebus/actions?query=workflow%3A%22Unit+Tests%22) [![Build Status](https://github.com/braintree/framebus/workflows/Functional%20Tests/badge.svg)](https://github.com/braintree/framebus/actions?query=workflow%3A%22Functional+Tests%22) [![npm version](https://badge.fury.io/js/framebus.svg)](http://badge.fury.io/js/framebus)

Framebus allows you to easily send messages across frames (and iframes).

In one frame:

```js
import { initialize, emit } from "framebus";

const bus = initialize();

emit(bus, "message", {
  from: "Ron",
  contents: "they named it...San Diago",
});
```

In another frame:

```js
import { initialize, on } from "framebus";

const bus = initialize();

on(bus, "message", function (data) {
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

The `origin` sets the framebus configuration to only operate on the chosen origin.

The `channel` namespaces the events called with `on` and `emit` so you can have multiple buses on the page and have them only communicate with buses with the same channel value.

If a `verifyDomain` is passed, then the `on` listener will only fire if the domain of the origin of the post message matches the `location.href` value of page or the function passed for `verifyDomain` returns `true`.

```js
const bus = initialize({
  verifyDomain: function (url) {
    // only return true if the domain of the url matches exactly
    url.startsWith("https://my-domain/");
  },
});
```

## API

#### `emit<T = unknown>(config, 'event', data?, callback?): Promise<T>`

**returns**: `true` if the event was successfully published, `false` otherwise

| Argument         | Type           | Description                                          |
| ---------------- | -------------- | ---------------------------------------------------- |
| `config`         | FramebusConfig | The Framebus configuration to use                    |
| `event`          | String         | The name of the event                                |
| `data`           | Object         | The data to give to subscribers                      |
| `callback(data)` | Function       | Give subscribers a function for easy, direct replies |

#### `emitAsPromise('event', data?): Promise`

**returns**: A promise that resolves when the emitted event is responded to the first time. It will reject if the event could not be succesfully published.

| Argument | Type           | Description                       |
| -------- | -------------- | --------------------------------- |
| `config` | FramebusConfig | The Framebus configuration to use |
| `event`  | String         | The name of the event             |
| `data`   | Object         | The data to give to subscribers   |

#### `on(config, 'event', fn): boolean`

**returns**: `true` if the subscriber was successfully added, `false` otherwise

Unless already bound to a scope, the listener will be executed with `this` set
to the `MessageEvent` received over postMessage.

| Argument               | Type           | Description                                             |
| ---------------------- | -------------- | ------------------------------------------------------- | --- | ----- | ----------------------------------------------------------- |
| `config`               | FramebusConfig | The Framebus configuration to use                       |
| `event`                | String         | The name of the event                                   |
| `fn(data?, callback?)` | Function       | Event handler. Arguments are from the `emit` invocation |
| ↳ `this`               |                |                                                         |     | scope | The `MessageEvent` object from the underlying `postMessage` |

#### `off('event', fn): boolean`

**returns**: `true` if the subscriber was successfully removed, `false` otherwise

| Argument | Type           | Description                       |
| -------- | -------------- | --------------------------------- | --- |
| `config` | FramebusConfig | The Framebus configuration to use | "   |
| `event`  | String         | The name of the event             |
| `fn`     | Function       | The function that was subscribed  |

#### `include(config, popup): boolean`

**returns**: `true` if the popup was successfully included, `false` otherwise

```javascript
var popup = window.open("https://example.com");

include(bus, popup);
emit(bus, "hello popup and friends!");
```

| Argument | Type           | Description                                  |
| -------- | -------------- | -------------------------------------------- |
| `config` | FramebusConfig | The Framebus configuration to use            |
| `popup`  | Window         | The popup refrence returned by `window.open` |

#### `teardown(): void`

Calls `off` on all listeners used for this bus instance and makes subsequent calls to all methods `noop`.

```javascript
on(bus, "event-name", handler);

// event-name listener is torn down
teardown(bus);

// these now do nothing
on(bus, "event-name", handler);
emit(bus, "event-name", data);
off(bus, "event-name", handler);
```

## Pitfalls

These are some things to keep in mind while using **framebus** to handle your
event delegation

### Cross-site scripting (XSS)

**framebus** allows convenient event delegation across iframe borders. By
default it will broadcast events to all iframes on the page, regardless of
origin. Use the optional `origin` parameter when you know the exact domain of
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
   const callback = function (data) {
     console.log("Got back %s as a reply!", data);
   };

   emit(bus, "Marco!", callback);
   ```

1. The **framebus** on `http://emitter.example.com` generates a UUID as an event name
   and adds the `callback` as a subscriber to this event.
1. The **framebus** on `http://listener.example.com` sees that a special callback
   event is in the event payload. A one-time-use function is created locally and
   given to subscribers of `'Marco!'` as the event data.
1. The subscriber on `http://listener.example.com` uses the local one-time-use
   callback function to send data back to the emitter's origin

   ```javascript
   const bus = initialize({
     origin: "http://emitter.example.com")
   });

    on(bus, "Marco!", function (callback) {
      callback("Polo!");
    });
   ```

1. The one-time-use function on `http://listener.example.com` publishes an event
   as the UUID generated in **step 2** to the origin that emitted the event.
1. Back on `http://emitter.example.com`, the `callback` is called and
   unsubscribed from the special UUID event afterward.

## Development and contributing

See [**CONTRIBUTING.md**](CONTRIBUTING.md)
