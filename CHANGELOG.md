# 5.2.1

- Fix circular dependency issue ([Issue #97](https://github.com/braintree/framebus/issues/97))

# 5.2.0

- Add ability to target specific frames with `targetFrames` configuration
- Add `addTargetFrame` method to add additional frames to `targetFrames`

# 5.1.2

- Fix issue where framebus could not be used with server side
  rendering

# 5.1.1

- Fix issue where Internet Explorer would error because Promise is not
  defined

# 5.1.0

- Fix issue where emitting to new window could cause an infinite loop
  (closes \#41, thanks @blutorange)
- Add `emitAsPromise` as convenience method when waiting for replies
  from `emit` calls
- Add `setPromise` static method for easy polyfilling environments
  that do not support promises

# 5.0.0

- Allow scoping to a specific channel for events

  ```js
  var bus = new Framebus({
    channel: "some-unique-identifier-used-on-both-the-parent-and-child-pages",
  });
  ```

- Add `verifyDomain` config to scope messages to specific domains

  ```js
  var bus = new Framebus({
    verifyDomain: function (url) {
      // only listens for events emitted from `https://parent-url.example.com` and `https://my-domain.example.com`
      return url.indexOf("https://my-domain.example.com");
    },
  });
  ```

- Add `teardown` method for easy cleanup

_Breaking Changes_

- Instantiate new instances of framebus

  ```js
  // v4
  var bus = require("framebus");
  bus.on(/* args */);
  bus.emit(/* args */);

  // v5
  var Framebus = require("framebus");
  var bus = new Framebus();
  bus.on(/* args */);
  bus.emit(/* args */);
  ```

- Instantiating a framebus with `target` method with an `origin` param
  now requires an options object (same object that is used to
  instantiate the instance)

  ```js
  // v4
  var bus = require("framebus");
  var anotherBus = bus.target("example.com");

  // v5
  var Framebus = require("framebus");
  var bus = Framebus.target({
    origin: "example.com",
  });
  var anotherBus = bus.target({
    origin: "example.com",
  });
  ```

# 4.0.5

- Fixup Framebus typing for Typescript integrations

# v4.0.3 and v4.0.4

- Use `@braintree/uuid` package for uuid generation
- Update typescript to v4

# v4.0.2

- Fix issue where rollup bundlers could not import framebus (see
  [braintree-web\#504](https://github.com/braintree/braintree-web/issues/504))

# v4.0.1

- Fix issue where framebus could not be used with server side
  rendering

# v4.0.0

_Breaking Changes_

- Drop support for IE \< 9
- Drop support for using methods standalone without using the bus
- Drop `publish`, `pub`, and `trigger` methods. Use `emit`
- Drop `subscribe` and `sub` methods. Use `on`
- Drop `unsubscribe` and `unsub` methods. Use `off`
- Drop support for passing multiple arguments to `emit`, not it only
  supports passing `data` and `reply`

# 3.0.2

- Fix issue where framebus would error when trying to reply to a
  non-existent window/frame

  # 3.0.1

- Fix issue where broadcasts to frames would fail if parent page has
  overwritten the window.length variable

  # 3.0.0

_BREAKING CHANGES_

- Module is now CommonJS only, and must be used with npm with a build
  tool (Browserify, Webpack, etc)

- Bower support dropped

  # 2.0.8

- Fall back to `window.self` when `window.top` is undefined in old
  versions of IE.

  # 2.0.7

- Corrects a regression introduced in 2.0.6 that prevented CommonJS
  runtimes from working.

  # 2.0.6

- framebus can be required (but not executed) from Node.js®
  environments.

  # 2.0.5

- Only traverse to `opener` from the top-level frame

  # 2.0.4

- Avoid exceptions while broadcasting events

  # 2.0.3

- Do not infinitely recurse when `window.opener === window`

  # 2.0.2

\[unpublished\]

# 2.0.1

- Do not throw exceptions `window.opener` existed but has already
  closed.

- Do not throw exceptions when a `frame.postMessage` is denied.

- Exceptions are no longer thrown when `publish`, `subscribe` or
  `unsubscribe` were invoked directly.

  ```javascript
  var publish = framebus.publish;
  publish("event");
  ```

  # 2.0.0

- Breaking change: use of `origin` as a parameter for `publish`,
  `subscribe` and `unsubscribe` has been moved to the
  chaining-function `target(origin)`

- Added feature: events can be published with multiple arguments. If
  the last argument is a function, it is treated as a callback that
  subscribers can call.

- Added feature: `include(popup)` adds popups to the listing of frames
  to be messaged.

- Added feature: `window.opener` will now be included in framebus
  messaging, if available.

  # 1.0.0

- Initial release
