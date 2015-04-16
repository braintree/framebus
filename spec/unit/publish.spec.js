'use strict';

describe('publish', function () {
  beforeEach(function () {
    this.bus._attach(mkWindow());
  });

  it('should return false if event is not a string', function () {
    var actual = this.bus.publish({}, "");

    expect(actual).to.be.false;
  });

  it('should return false if origin is not a string', function () {
    var actual = this.bus.publish("event", "", { origin: "object"});

    expect(actual).to.be.false;
  });

  it('should return true if origin and event are strings', function () {
    var actual = this.bus.publish("event", "", "https://example.com");

    expect(actual).to.be.true;
  });
});
