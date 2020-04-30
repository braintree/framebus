'use strict';

describe('unsubscribe', function () {
  it('should be directly usable', function () {
    var unsubscribe = bus.unsubscribe;

    expect(function () {
      unsubscribe('event', function () {});
    }).not.toThrowError();
  });

  it('should remove subscriber given event and origin', function () {
    var event = 'the event';
    var origin = 'https://example.com';
    var fn = function () {};
    var s = bus._getSubscribers();

    s[origin] = {};
    s[origin][event] = [function () {}, fn];

    bus.target(origin).unsubscribe(event, fn);

    expect(s[origin][event]).not.toContain(fn);
    expect(s[origin][event].length).toBe(1);
  });

  it('should correctly update the array', function () {
    var event = 'the event';
    var origin = 'https://example.com';
    var fn = function () {};
    var s = bus._getSubscribers();

    s[origin] = {};
    s[origin][event] = [function () {}, fn];

    bus.target(origin).unsubscribe(event, fn);

    expect(s[origin][event].length).toBe(1);
  });

  it('should return true if removed', function () {
    var actual;
    var event = 'the event';
    var origin = 'https://example.com';
    var fn = function () {};
    var s = bus._getSubscribers();

    s[origin] = {};
    s[origin][event] = [function () {}, fn];

    actual = bus.target(origin).unsubscribe(event, fn);

    expect(actual).toBe(true);
  });

  it('should return false if not removed for unknown event', function () {
    var actual;
    var event = 'the event';
    var origin = 'https://example.com';
    var fn = function () {};
    var s = bus._getSubscribers();

    s[origin] = {};
    s[origin][event] = [function () {}, fn];

    actual = bus.target(origin).unsubscribe('another event', fn);

    expect(actual).toBe(false);
  });

  it('should return false if not removed for unknown origin', function () {
    var actual;
    var event = 'the event';
    var origin = 'https://example.com';
    var fn = function () {};
    var s = bus._getSubscribers();

    s[origin] = {};
    s[origin][event] = [function () {}, fn];

    actual = bus.target('https://another.domain').unsubscribe(event, fn);

    expect(actual).toBe(false);
  });
});
