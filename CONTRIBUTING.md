# How to contribute

We welcome pull requests, issue submissions, and feature requests. Before contributing, please read these guidelines.

## Requirements

This library strives to be compatible with **IE9+**, so please be aware of any ECMAScript5 usages that do not operate in all browsers. If you are contributing code features or changes, we will expect tests to be in your submission. If there are no tests but the submission is a small change we may allow it.

## Contributing documentation

Feel free to edit `README.md` and submit it as a pull request either through GitHub's interface or through submitting a PR from your own fork.

## Contributing code

### Getting started

We use `nvm` for managing our node versions, but you do not have to. Replace any `nvm` references with the tool of your choice below.

```
nvm install
npm install
```

### Testing

This library uses a combination of unit-style testing and functional/smoke style testing. The unit tests use [Jest](http://jestjs.io) while the functional tests use a combination of [Webdriver.io](http://webdriver.io/) and Mocha. All testing dependencies will be installed upon `npm install` and the test suite executed with `npm test`.

```
npm test
```

### Servers for manual testing

The test suite automatically starts the servers for functional testing, but if you like to have the servers stood up for your own manual testing, you can do so:

```
npm start
```

The default ports are `3099` and `4567` and can be set via `PORT` and `PORT2` environment variables, respectively.

```
env PORT=8000 PORT2=8001 npm start
```

The app server and templates default the host to `localhost`. This can be changed with the `HOST` environment variable.

```
env HOST=example.com npm start
```
