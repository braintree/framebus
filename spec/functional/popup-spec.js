'use strict';

var wdSync = require('wd-sync');

describe('Popup Events', function () {
  var browser;
  var wrap = wdSync.wrap({
    'with': function () { return browser; },
    pre: function () { this.timeout(60000); }
  });

  before(function (done) {
    var client = wdSync.remote();

    browser = client.browser;
    done();
  });

  it('should be able to receive events from opener frames', wrap(function () {
    var actual, rootWindowName;
    var expected = 'hello from frame3!';

    browser.init({browserName: 'firefox'});
    browser.get('http://localhost:3099'); // pull out, variablize

    rootWindowName = browser.windowName();

    browser.elementById('open-popup').click();

    browser.window('popup');
    browser.waitForElementByTagName('body', function (el) {
      return el.innerHTML != null;
    }, 1000);
    browser.window(rootWindowName);

    browser.frame('frame3');
    browser.elementById('popup-message').type(expected);
    browser.elementById('send').click();

    browser.window('popup');

    browser.waitForElementByTagName('p', function (el) {
      return el.innerHTML !== '';
    }, 1000);
    actual = browser.elementByTagName('p').text();

    browser.quit();

    expect(actual).to.equal(expected);
  }));

  it('should be able to send events to opener frames', wrap(function () {
    var actual, rootWindowName;
    var expected = 'hello from popup!';

    browser.init({browserName: 'firefox'});
    browser.get('http://localhost:3099'); // pull out, variablize

    rootWindowName = browser.windowName();

    browser.elementById('open-popup').click();

    browser.window('popup');
    browser.waitForElementByTagName('body', function (el) {
      return el.innerHTML != null;
    }, 1000);
    browser.elementById('from-popup-message').type(expected);
    browser.elementById('send').click();

    browser.window(rootWindowName);
    browser.frame('frame2');

    browser.waitForElementByTagName('p', function (el) {
      return el.innerHTML !== '';
    }, 1000);
    actual = browser.elementByTagName('p').text();

    browser.quit();

    expect(actual).to.contain(expected);
  }));

  it('should not double-receive events in popups', wrap(function () {
    var actual, rootWindowName;
    var expected = 'hello from popup!';

    browser.init({browserName: 'firefox'});
    browser.get('http://localhost:3099'); // pull out, variablize

    rootWindowName = browser.windowName();

    browser.elementById('open-popup').click();

    browser.window('popup');
    browser.waitForElementByTagName('body', function (el) {
      return el.innerHTML != null;
    }, 1000);
    browser.elementById('from-popup-message').type(expected);
    browser.elementById('send').click();

    browser.window(rootWindowName);
    browser.frame('frame2');

    browser.waitForElementByTagName('p', function (el) {
      return el.innerHTML !== '';
    }, 1000);
    actual = browser.elementByTagName('p').text();

    browser.quit();

    expect(actual).not.to.contain('FAILURE');
  }));
});
