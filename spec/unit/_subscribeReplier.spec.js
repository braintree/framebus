'use strict';

describe('_subscribeReplier', function () {
  it('should return UUID of reply event', function () {
    var actual = bus._subscribeReplier(function () {}, '*');

    expect(actual).toMatch(/^\w{8}-\w{4}-4\w{3}-\w{4}-\w{12}$/);
  });

  it('should subscribe function to returned event', function () {
    var origin = 'http://example.com';
    var event = bus._subscribeReplier(function () {}, origin);

    expect(bus._getSubscribers()[origin][event][0]).toBeInstanceOf(Function);
  });

  it('should unsubscribe function when reply invoked', function () {
    var origin = 'http://example.com';
    var event = bus._subscribeReplier(function () {}, origin);

    expect(bus._getSubscribers()[origin][event][0]).toBeInstanceOf(Function);

    bus._getSubscribers()[origin][event][0]();

    expect(bus._getSubscribers()[origin][event][0]).not.toBeDefined();
  });
});
