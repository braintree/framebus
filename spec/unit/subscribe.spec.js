'use strict';

describe('subscribe', function () {
  it('should be directly usable', function () {
    var subscribe = bus.subscribe;

    expect(function () {
      subscribe('event', function () {});
    }).not.toThrowError();
  });

  it('should add subscriber to given event and origin', function () {
    var event = 'event name';
    var origin = 'https://example.com';
    var fn = function () {};

    bus.target(origin).subscribe(event, fn);

    expect(bus._getSubscribers()[origin][event]).toEqual(expect.arrayContaining([fn]));
  });

  it('should add subscriber to given event and * origin if origin not given', function () {
    var event = 'event name';
    var fn = function () {};

    bus.subscribe(event, fn);

    expect(bus._getSubscribers()['*'][event]).toEqual(expect.arrayContaining([fn]));
  });
});
