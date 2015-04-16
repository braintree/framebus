'use strict';

describe('_subscribeReplier', function () {
  it('should return UUID of reply event', function () {
    var actual = this.bus._subscribeReplier(function () {}, '*');

    expect(actual).to.match(/^\w{8}-\w{4}-4\w{3}-\w{4}-\w{12}$/);
  });

  it('should subscribe function to returned event', function () {
    var origin = 'http://example.com';
    var event = this.bus._subscribeReplier(function () {}, origin);

    expect(this.bus._getSubscribers()[origin][event][0]).to.be.a('function');
  });

  it('should unsubscribe function when reply invoked', function () {
    var origin = 'http://example.com';
    var event = this.bus._subscribeReplier(function () {}, origin);

    expect(this.bus._getSubscribers()[origin][event][0]).to.be.a('function');

    this.bus._getSubscribers()[origin][event][0]();

    expect(this.bus._getSubscribers()[origin][event][0]).not.to.exist;
  });
});
