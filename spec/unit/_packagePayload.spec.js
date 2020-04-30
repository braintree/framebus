'use strict';

describe('_packagePayload', function () {
  it('should add event to payload', function () {
    var expected = 'event name';

    var result = bus._packagePayload.call(bus, expected, [], '*');
    var actual = JSON.parse(result.replace(messagePrefix, '')).event;

    expect(actual).toBe(expected);
  });

  it('should add data to payload', function () {
    var expected = {some: 'data'};
    var args = [expected];

    var result = bus._packagePayload.call(bus, 'event', args, '*');
    var actual = JSON.parse(result.replace(messagePrefix, ''));

    expect(actual.args[0]).toEqual(expected);
  });

  it('should add reply to payload if data is function', function () {
    var args = [function () {}];

    var result = bus._packagePayload.call(bus, 'event', args, '*');
    var actual = JSON.parse(result.replace(messagePrefix, ''));

    expect(typeof actual.reply).toBe('string');
    expect(actual.args).toHaveLength(0);
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
      bus._packagePayload('event', args, '*');
    };

    expect(fn).toThrowError('Could not stringify event: ');
  });
});
