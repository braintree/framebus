'use strict';

describe('subscribe', function () {
  it('should add subscriber to given event and origin', function () {
    var event = 'event name';
    var origin = 'https://example.com';
    var fn = function () {};

    this.bus.subscribe(event, fn, origin);

    expect(this.bus._getSubscribers()[origin][event]).to.contain(fn);
  });

  it('should add subscriber to given event and * origin if origin not given', function () {
    var event = 'event name';
    var fn = function () {};

    this.bus.subscribe(event, fn);

    expect(this.bus._getSubscribers()['*'][event]).to.contain(fn);
  });
});
