'use strict';

describe('subscribe', function () {
  it('should be directly usable', function () {
    var subscribe = this.bus.subscribe;

    expect(function () {
      subscribe('event', function () {});
    }).not.to.throw();
  });

  it('should add subscriber to given event and origin', function () {
    var event = 'event name';
    var origin = 'https://example.com';
    var fn = function () {};

    this.bus.target(origin).subscribe(event, fn);

    expect(this.bus._getSubscribers()[origin][event]).to.contain(fn);
  });

  it('should add subscriber to given event and * origin if origin not given', function () {
    var event = 'event name';
    var fn = function () {};

    this.bus.subscribe(event, fn);

    expect(this.bus._getSubscribers()['*'][event]).to.contain(fn);
  });
});
