'use strict';

describe('_packagePayload', function () {
  beforeEach(function () {
    this.args = ['event', {}, '*'];
  });

  it('should add event to payload', function () {
    var expected = 'event name';
    this.args[0] = expected;

    var result = this.bus._packagePayload.apply(this.bus, this.args);
    var actual = JSON.parse(result).event;

    expect(actual).to.equal(expected);
  });

  it('should add data to payload', function () {
    var expected = { some: 'data' };
    this.args[1] = expected;

    var result = this.bus._packagePayload.apply(this.bus, this.args);
    var actual = JSON.parse(result).data;

    expect(actual).to.deep.equal(expected);
  });

  it('should add reply to payload if data is function', function () {
    this.args[1] = function () {};

    var result = this.bus._packagePayload.apply(this.bus, this.args);
    var actual = JSON.parse(result);

    expect(actual.reply).to.be.a('string');
    expect(actual.data).not.to.exist;
  });

  it('should throw error with prefix text when element cannot be stringified', function () {
    var payload = {};
    Object.defineProperty(payload, 'prop', {
      get: function () { throw new Error('Cross-origin denied'); },
      enumerable: true
    });
    this.args[1] = payload;

    var fn = function () {
      this.bus._packagePayload.apply(this.bus, this.args);
    }.bind(this);

    expect(fn).to.throw('Could not stringify event: ');
  });
});
