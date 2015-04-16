'use strict';

describe('_dispatch', function () {
  it('should execute subscribers for the given event and origin', function () {
    var subscriber = this.sandbox.spy();
    var origin = 'https://example.com';
    this.bus.subscribe('test event', subscriber, origin);

    this.bus._dispatch(origin, 'test event', 'data', origin)

    expect(subscriber).to.have.been.called;
  });

  it('should not execute subscribers for a different event', function () {
    var subscriber = this.sandbox.spy();
    var origin = 'https://example.com';
    this.bus.subscribe('test event', subscriber, origin);

    this.bus._dispatch(origin, 'different event', 'data', null)

    expect(subscriber).not.to.have.been.called;
  });

  it('should not execute subscribers for a different domain', function () {
    var subscriber = this.sandbox.spy();
    var origin = 'https://example.com';
    this.bus.subscribe('test event', subscriber, origin);

    this.bus._dispatch('https://domain.com', 'test event', 'data', null)

    expect(subscriber).not.to.have.been.called;
  });
});
