'use strict';

describe('_attach', function () {
  beforeEach(function () {
    this.bus._detach();
  });
  it('should add listener to scope', function () {
    this.bus._attach(this.scope);

    expect(this.scope.addEventListener)
      .to.have.been.calledWith('message', this.bus._onmessage, false);
  });

  it('should only add listener to scope once', function () {
    this.bus._attach(this.scope);
    this.bus._attach(this.scope);

    expect(this.scope.addEventListener.callCount).to.equal(1);
  });

  it('should use attachEvent if addEventListener not available', function () {
    delete this.scope.addEventListener;
    this.scope.attachEvent = this.sandbox.spy();

    this.bus._attach(this.scope);

    expect(this.scope.attachEvent).to.have.been.calledWith('onmessage', this.bus._onmessage);
  });

  it('should assign to onmessage if event attachers are not available', function () {
    delete this.scope.addEventListener;
    this.scope.onmessage = null;

    this.bus._attach(this.scope);

    expect(this.scope.onmessage).to.equal(this.bus._onmessage);
  });

  it('should not attach if no event adders or onmessage present', function () {
    delete this.scope.addEventListener;

    this.bus._attach(this.scope);

    expect(this.scope.onmessage).to.be.undefined;
    expect(this.bus._win()).not.to.exist;
  });
});
