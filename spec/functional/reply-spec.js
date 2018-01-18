'use strict';

var wdSync = require('wd-sync');

describe('Reply Events', function () {
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

  it('should only publish to targeted domains and print reply', wrap(function () {
    var rootWindowName, indexReceived, frame1Received, frame2Received, frame3ReceivedQuestion;

    browser.init({browserName: 'chrome'});
    browser.get('http://localhost:3099'); // pull out, variablize

    rootWindowName = browser.windowName();

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
    indexReceived = browser.elementByTagNameIfExists('p');

    browser.window(rootWindowName);
    browser.frame('frame1');
    frame1Received = browser.elementByTagNameIfExists('p');

    browser.window(rootWindowName);
    browser.frame('frame2');
    frame2Received = browser.elementByTagNameIfExists('p');

    browser.window(rootWindowName);
    browser.frame('frame3');
    frame3ReceivedQuestion = browser.elementByTagName('p').text();

    browser.quit();

    expect(indexReceived).to.be.undefined;
    expect(frame1Received).to.be.undefined;
    expect(frame2Received).to.be.undefined;
    expect(frame3ReceivedQuestion).to.equal('are you there?');
  }));
});
