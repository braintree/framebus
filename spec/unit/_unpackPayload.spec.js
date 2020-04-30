'use strict';

describe('_unpackPayload', function () {
  it('should return false if unparsable', function () {
    var actual = bus._unpackPayload({data: '}{'});

    expect(actual).toBe(false);
  });

  it('should return false if not prefixed', function () {
    var actual = bus._unpackPayload({data: JSON.stringify({})});

    expect(actual).toBe(false);
  });

  it('should return event and args in payload', function () {
    var event = 'event name';
    var args = ['my string'];
    var actual = bus._unpackPayload({
      data: messagePrefix + JSON.stringify({event: event, args: args})
    });

    expect(actual.event).toBe(event);
    expect(actual.args.length).toBe(1);
    expect(actual.args).toEqual(expect.arrayContaining(['my string']));
  });

  it('should return event and args and reply in payload', function () {
    var event = 'event name';
    var reply = '123129085-4234-1231-99887877';
    var args = ['some data'];
    var actual = bus._unpackPayload({
      data: messagePrefix + JSON.stringify({event: event, reply: reply, args: args})
    });

    expect(actual.event).toBe(event);
    expect(actual.args[1]).toBeInstanceOf(Function);
    expect(actual.args[0]).toBe('some data');
  });

  it('the source should postMessage the payload to the origin when reply is called', function () {
    var fakeSource = {
      postMessage: jest.fn()
    };
    var reply = '123129085-4234-1231-99887877';
    var args = ['some data'];
    var actual = bus._unpackPayload({
      source: fakeSource,
      origin: 'origin',
      data: messagePrefix + JSON.stringify({event: 'event name', reply: reply, args: args})
    });

    actual.reply({});

    expect(fakeSource.postMessage).toBeCalledTimes(1);
    expect(fakeSource.postMessage).toBeCalledWith(expect.any(String), 'origin');
  });

  it('the source should not attempt to postMessage the payload to the origin if no source available', function () {
    var reply = '123129085-4234-1231-99887877';
    var args = ['some data'];
    var actual = bus._unpackPayload({
      origin: 'origin',
      data: messagePrefix + JSON.stringify({event: 'event name', reply: reply, args: args})
    });

    expect(function () {
      actual.reply({});
    }).not.toThrowError();
  });
});
