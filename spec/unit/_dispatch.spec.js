'use strict';

describe('_dispatch', function () {
  it('should execute subscribers for the given event and origin', function () {
    var subscriber = jest.fn();
    var origin = 'https://example.com';

    bus.target(origin).subscribe('test event', subscriber);

    bus._dispatch(origin, 'test event', ['data']);

    expect(subscriber).toBeCalled();
  });

  it('should not execute subscribers for a different event', function () {
    var subscriber = jest.fn();
    var origin = 'https://example.com';

    bus.target(origin).subscribe('test event', subscriber);

    bus._dispatch(origin, 'different event', ['data']);

    expect(subscriber).not.toBeCalled();
  });

  it('should not execute subscribers for a different domain', function () {
    var subscriber = jest.fn();
    var origin = 'https://example.com';

    bus.target(origin).subscribe('test event', subscriber);

    bus._dispatch('https://domain.com', 'test event', ['data']);

    expect(subscriber).not.toBeCalled();
  });
});
