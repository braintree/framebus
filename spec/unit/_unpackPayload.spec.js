'use strict';

describe('_unpackPayload', function () {
  it('should return false if unparsable', function () {
    var actual = this.bus._unpackPayload({ data: {} });

    expect(actual).to.be.false;
  });

  it('should return false if event not defined', function () {
    var actual = this.bus._unpackPayload({ data: JSON.stringify({}) });

    expect(actual).to.be.false;
  });

  it('should return event and data in payload', function () {
    var event = 'event name';
    var data = 'my string';
    var actual = this.bus._unpackPayload({
      data: JSON.stringify({event: event, data: data })
    });

    expect(actual.event).to.equal(event);
    expect(actual.data).to.equal(data);
  });

  it('should return event and data in payload', function () {
    var event = 'event name';
    var reply = '123129085-4234-1231-99887877';
    var actual = this.bus._unpackPayload({
      data: JSON.stringify({event: event, reply: reply })
    });

    expect(actual.event).to.equal(event);
    expect(actual.data).to.be.a('function');
  });
});
