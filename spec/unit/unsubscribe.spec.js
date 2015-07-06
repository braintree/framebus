'use strict';

describe('unsubscribe', function () {
  it('should be directly usable', function () {
    var unsubscribe = this.bus.unsubscribe;

    expect(function () {
      unsubscribe('event', function () {});
    }).not.to.throw();
  });

  it('should remove subscriber given event and origin', function () {
    var event = 'the event';
    var origin = 'https://example.com';
    var fn = function () {};
    var s = this.bus._getSubscribers();
    s[origin] = {};
    s[origin][event] = [function () {}, fn];

    this.bus.target(origin).unsubscribe(event, fn);

    expect(s[origin][event]).not.to.contain(fn);
    expect(s[origin][event].length).to.equal(1);
  });

  it('should correctly update the array', function () {
    var event = 'the event';
    var origin = 'https://example.com';
    var fn = function () {};
    var s = this.bus._getSubscribers();
    s[origin] = {};
    s[origin][event] = [function () {}, fn];

    this.bus.target(origin).unsubscribe(event, fn);

    expect(s[origin][event].length).to.equal(1);
  });

  it('should return true if removed', function () {
    var event = 'the event';
    var origin = 'https://example.com';
    var fn = function () {};
    var s = this.bus._getSubscribers();
    s[origin] = {};
    s[origin][event] = [function () {}, fn];

    var actual = this.bus.target(origin).unsubscribe(event, fn);

    expect(actual).to.be.true;
  });

  it('should return false if not removed for unknown event', function () {
    var event = 'the event';
    var origin = 'https://example.com';
    var fn = function () {};
    var s = this.bus._getSubscribers();
    s[origin] = {};
    s[origin][event] = [function () {}, fn];

    var actual = this.bus.target(origin).unsubscribe('another event', fn);

    expect(actual).to.be.false;
  });

  it('should return false if not removed for unknown origin', function () {
    var event = 'the event';
    var origin = 'https://example.com';
    var fn = function () {};
    var s = this.bus._getSubscribers();
    s[origin] = {};
    s[origin][event] = [function () {}, fn];

    var actual = this.bus.target('https://another.domain').unsubscribe(event, fn);

    expect(actual).to.be.false;
  });
});
