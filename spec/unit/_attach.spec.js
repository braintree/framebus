'use strict';

describe('_attach', function () {
  beforeEach(function () {
    bus._detach();
  });

  it('should add listener to scope', function () {
    bus._attach(scope);

    expect(scope.addEventListener)
      .toBeCalledWith('message', bus._onmessage, false);
  });

  it('should only add listener to scope once', function () {
    bus._attach(scope);
    bus._attach(scope);

    expect(scope.addEventListener).toBeCalledTimes(1);
  });

  it('should use attachEvent if addEventListener not available', function () {
    delete scope.addEventListener;
    scope.attachEvent = jest.fn();

    bus._attach(scope);

    expect(scope.attachEvent).toBeCalledWith('onmessage', bus._onmessage);
  });

  it('should assign to onmessage if event attachers are not available', function () {
    delete scope.addEventListener;
    scope.onmessage = null;

    bus._attach(scope);

    expect(scope.onmessage).toBe(bus._onmessage);
  });

  it('should not attach if no event adders or onmessage present', function () {
    delete scope.addEventListener;

    bus._attach(scope);

    expect(scope.onmessage).toBeFalsy();
    expect(bus._win()).toBeFalsy();
  });
});
