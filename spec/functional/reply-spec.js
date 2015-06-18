'use strict';

var wdSync = require('wd-sync');

describe('Reply Events', function () {
  var browser;
  var wrap = wdSync.wrap({
    with: function () { return browser },
    pre: function () { this.timeout(30000); }
  });

  before(function (done) {
    var client = wdSync.remote();
    browser = client.browser;
    done();
  });

  it('should only publish to targeted domains and print reply', wrap(function () {
    browser.init({ browserName: 'firefox' });
    browser.get('http://localhost:3099'); // pull out, variablize

    var rootWindowName = browser.windowName();

    browser.frame('frame3');
    browser.elementById('polo-text').type('polo');
    browser.window(rootWindowName);
    browser.frame('frame1');
    browser.frame('frame1-inner');
    browser.elementById('marco-button').click();

    browser.waitForElementByTagName('p', function (el) {
      return el.innerHTML === 'polo';
    }, 1000);

    browser.window(rootWindowName);
    var indexReceived = browser.elementByTagNameIfExists('p');

    browser.window(rootWindowName);
    browser.frame('frame1');
    var frame1Received = browser.elementByTagNameIfExists('p');

    browser.window(rootWindowName);
    browser.frame('frame2');
    var frame2Received = browser.elementByTagNameIfExists('p');

    browser.window(rootWindowName);
    browser.frame('frame3');
    var frame3ReceivedQuestion = browser.elementByTagName('p').text();

    browser.quit();

    expect(indexReceived).to.be.undefined;
    expect(frame1Received).to.be.undefined;
    expect(frame2Received).to.be.undefined;
    expect(frame3ReceivedQuestion).to.equal('are you there?');
  }));
});
