'use strict';

describe('_packagePayload', function () {
  it('should add event to payload', function () {
    var expected = 'event name';

    var result = this.bus._packagePayload.call(this.bus, expected, [], '*');
    var actual = JSON.parse(result.replace(messagePrefix, '')).event;

    expect(actual).to.equal(expected);
  });

  it('should add data to payload', function () {
    var expected = {some: 'data'};
    var args = [expected];

    var result = this.bus._packagePayload.call(this.bus, 'event', args, '*');
    var actual = JSON.parse(result.replace(messagePrefix, ''));

    expect(actual.args[0]).to.deep.equal(expected);
  });

  it('should add reply to payload if data is function', function () {
    var args = [function () {}];

    var result = this.bus._packagePayload.call(this.bus, 'event', args, '*');
    var actual = JSON.parse(result.replace(messagePrefix, ''));

    expect(actual.reply).to.be.a('string');
    expect(actual.args).to.be.empty;
  });

  it('should throw error with prefix text when element cannot be stringified', function () {
    var args, fn;
    var payload = {};

    Object.defineProperty(payload, 'prop', {
      get: function () { throw new Error('Cross-origin denied'); },
      enumerable: true
    });
    args = [payload];

    fn = function () {
      this.bus._packagePayload('event', args, '*');
    }.bind(this);

    expect(fn).to.throw('Could not stringify event: ');
  });
});
