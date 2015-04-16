'use strict';
(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.framebus = factory();
  }
})(this, function () {
  var win;
  var subscribers = {};

  function publish(event, data, origin) {
    var payload;
    origin = origin || '*';
    if (typeof event !== 'string') { return false; }
    if (typeof origin !== 'string') { return false; }

    payload = _packagePayload(event, data, origin);
    if (payload === false) { return false; }

    _broadcast(win.top, payload, origin);

    return true;
  }

  function subscribe(event, fn, origin) {
    origin = origin || '*';
    if (_subscriptionArgsInvalid(event, fn, origin)) { return false; }

    subscribers[origin] = subscribers[origin] || {};
    subscribers[origin][event] = subscribers[origin][event] || [];
    subscribers[origin][event].push(fn);

    return true;
  }

  function unsubscribe(event, fn, origin) {
    var i, subscriberList;
    origin = origin || '*';

    if (_subscriptionArgsInvalid(event, fn, origin)) { return false; }

    subscriberList = subscribers[origin] && subscribers[origin][event];
    if (!subscriberList) { return false; }

    for (i = 0; i < subscriberList.length; i++) {
      if (subscriberList[i] === fn) {
        subscriberList.splice(i, 1);
        return true;
      }
    }

    return false;
  }

  function _packagePayload(event, data, origin) {
    var packaged = false;
    var payload = { event: event };

    if (typeof data === 'function') {
      payload.reply = _subscribeReplier(data, origin);
    } else {
      payload.data = data;
    }

    try {
      packaged = JSON.stringify(payload);
    } catch (e) {
      throw new Error('Could not stringify event: ' + e.message);
    }
    return packaged;
  }

  function _unpackPayload(e) {
    var payload, replyOrigin, replySource;

    try {
      payload = JSON.parse(e.data);
    } catch (err) {
      return false;
    }

    if (payload.event == null) { return false; }

    if (payload.reply != null) {
      replyOrigin = e.origin;
      replySource = e.source;

      payload.data = function reply(data) {
        var replyPayload = _packagePayload(payload.reply, data, replyOrigin);
        if (replyPayload === false) { return false; }

        replySource.postMessage(replyPayload, replyOrigin);
      };
    }

    return payload;
  }

  function _attach(w) {
    if (win) { return; }
    win = w;

    if (win.addEventListener) {
      win.addEventListener('message', _onmessage, false);
    } else if (win.attachEvent) {
      win.attachEvent('onmessage', _onmessage);
    } else if (win.onmessage === null) {
      win.onmessage = _onmessage;
    } else {
      win = null;
    }
  }

  function _uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      var v = c === 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  }

  function _onmessage(e) {
    var payload;
    if (typeof e.data !== 'string') { return; }

    payload = _unpackPayload(e);
    if (!payload) { return; }

    _dispatch('*', payload.event, payload.data, e.origin);
    _dispatch(e.origin, payload.event, payload.data, e.origin);
  }

  function _dispatch(origin, event, data, eventOrigin) {
    var i;
    if (!subscribers[origin]) { return; }
    if (!subscribers[origin][event]) { return; }

    for (i = 0; i < subscribers[origin][event].length; i++) {
      subscribers[origin][event][i](data, eventOrigin);
    }
  }

  function _broadcast(frame, payload, origin) {
    var i;
    frame.postMessage(payload, origin);

    for (i = 0; i < frame.frames.length; i++) {
      _broadcast(frame.frames[i], payload, origin);
    }
  }

  function _subscribeReplier(fn, origin) {
    var uuid = _uuid();

    function replier(d, o) {
      fn(d, o);
      unsubscribe(uuid, replier, origin);
    }

    subscribe(uuid, replier, origin);
    return uuid;
  }

  function _subscriptionArgsInvalid(event, fn, origin) {
    if (typeof event !== 'string') { return true; }
    if (typeof fn !== 'function') { return true; }
    if (typeof origin !== 'string') { return true; }

    return false;
  }

  _attach(window);

  return {
    publish:                  publish,
    pub:                      publish,
    trigger:                  publish,
    emit:                     publish,
    subscribe:                subscribe,
    sub:                      subscribe,
    on:                       subscribe,
    unsubscribe:              unsubscribe,
    unsub:                    unsubscribe,
    off:                      unsubscribe
  };
});
