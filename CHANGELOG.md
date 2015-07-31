unreleased
==========

* Do not throw exceptions when a `frame.postMessage` is denied
* Exceptions are no longer thrown when `publish`, `subscribe` or `unsubscribe` were invoked directly.

  ```javascript
    var publish = framebus.publish;
    publish('event');
  ```

2.0.0
=====

* Breaking change: use of `origin` as a parameter for `publish`, `subscribe` and `unsubscribe` has been moved to the chaining-function `target(origin)`
* Added feature: events can be published with multiple arguments. If the last argument is a function, it is treated as a callback that subscribers can call.
* Added feature: `include(popup)` adds popups to the listing of frames to be messaged.
* Added feature: `window.opener` will now be included in framebus messaging, if available.

1.0.0
=====

* Initial release
