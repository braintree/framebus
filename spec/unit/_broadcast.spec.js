'use strict';

describe('_broadcast', function () {
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
});
