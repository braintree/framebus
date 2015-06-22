'use strict';

describe('_unpackPayload', function () {
  it('should return false if unparsable', function () {
    var actual = this.bus._unpackPayload({ data: "}{" });

    expect(actual).to.be.false;
  });

  it('should return false if not prefixed', function () {
    var actual = this.bus._unpackPayload({ data: JSON.stringify({}) });

    expect(actual).to.be.false;
  });

  it('should return event and args in payload', function () {
    var event = 'event name';
    var args = ['my string'];
    var actual = this.bus._unpackPayload({
      data: messagePrefix + JSON.stringify({event: event, args: args })
    });

    expect(actual.event).to.equal(event);
    expect(actual.args.length).to.equal(1);
    expect(actual.args).to.contain('my string');
  });

  it('should return event and args and reply in payload', function () {
    var event = 'event name';
    var reply = '123129085-4234-1231-99887877';
    var args = ['some data'];
    var actual = this.bus._unpackPayload({
      data: messagePrefix + JSON.stringify({event: event, reply: reply, args: args})
    });

    expect(actual.event).to.equal(event);
    expect(actual.args[1]).to.be.a('function');
    expect(actual.args[0]).to.equal('some data');
  });
});
