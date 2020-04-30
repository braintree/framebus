'use strict';

describe('_subscriptionArgsInvalid', function () {
  var args;

  beforeEach(function () {
    args = ['event', function () {}, '*'];
  });

  it('should return false for valid types', function () {
    var actual = bus._subscriptionArgsInvalid.apply(bus, args);

    expect(actual).toBe(false);
  });

  it('should return true if event is not string', function () {
    var actual;

    args[0] = {};
    actual = bus._subscriptionArgsInvalid.apply(bus, args);

    expect(actual).toBe(true);
  });

  it('should return true if fn is not function', function () {
    var actual;

    args[1] = 'function';
    actual = bus._subscriptionArgsInvalid.apply(bus, args);

    expect(actual).toBe(true);
  });

  it('should return true if origin is not string', function () {
    var actual;

    args[2] = {event: 'object'};
    actual = bus._subscriptionArgsInvalid.apply(bus, args);

    expect(actual).toBe(true);
  });
});
