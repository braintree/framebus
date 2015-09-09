'use strict';

describe('_broadcast', function () {
  it('should not throw exception when postMessage is denied', function () {
    var frame = mkFrame(this);
    frame.postMessage = function () {
      throw new Error('Invalid calling object');
    }

    var self = this;
    expect(function () {
      self.bus._broadcast(frame, 'payload', '*');
    }).not.to.throw();
  });
  it('should postMessage to current frame', function () {
    var frame = mkFrame(this);
    this.bus._broadcast(frame, 'payload', '*');

    expect(frame.postMessage).to.have.been.called;
  });

  it("should postMessage to current frame's child frames", function () {
    var frame = mkFrame(this);
    frame.frames.push(mkFrame(this));

    this.bus._broadcast(frame, 'payload', '*');

    expect(frame.frames[0].postMessage).to.have.been.called;
  });

  it('should postMessage to window.opener if it exists', function () {
    var frame = mkFrame(this);
    frame.opener = {};
    frame.opener.top = {
      postMessage: this.sandbox.spy(),
      frames: []
    };

    this.bus._broadcast(frame, 'payload', '*');

    expect(frame.opener.top.postMessage).to.have.been.called;
  });

  it('should not postMessage to window.opener if it has closed', function () {
    var frame = mkFrame(this);
    frame.opener = {};
    frame.opener.closed = true;
    frame.opener.top = {
      postMessage: this.sandbox.spy(),
      frames: []
    };

    this.bus._broadcast(frame, 'payload', '*');

    expect(frame.opener.top.postMessage).not.to.have.been.called;
  });

  it.only('should not infinitely recurse if opener is itself', function (done) {
    var frame = mkFrame(this);
    frame.opener = frame;
    frame.top = frame;

    this.bus._broadcast(frame, 'payload', '*');

    // don't infinitely recurse
    done();
  });

  it("should postMessage to the window.opener's child frames", function () {
    var frame = mkFrame(this);

    frame.opener = {};
    frame.opener.top = {
      postMessage: this.sandbox.spy(),
      frames: [mkFrame(this)]
    };

    this.bus._broadcast(frame, 'payload', '*');

    expect(frame.opener.top.frames[0].postMessage).to.have.been.called;
  });
});
