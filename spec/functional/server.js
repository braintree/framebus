/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

let servers;
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const async = require("async");

const app = express();
const ports = [process.env.PORT || 3099, process.env.PORT2 || 4567];
const domain = process.env.HOST || "localhost";
const model = {
  port1: ports[0],
  port2: ports[1],
  domain: domain,
};

app.set("views", path.join(__dirname, "/public"));
app.set("view engine", "html");
app.engine("html", require("ejs").renderFile);

function _routeHandler(req, res) {
  const _path = req.path;
  const template =
    _path === "/" ? "index" : _path.replace(/^\/(.*)\.html$/, "$1");

  res.render(template, model);
}

app.get("/", _routeHandler);
app.get("/*.html", _routeHandler);

app.use(express.static(path.join(__dirname, "/public")));

function _noop() {
  // noop
}

function start(cb, logRequests) {
  cb = cb || _noop;

  if (logRequests) {
    app.use(morgan("combined"));
  }

  const asyncTasks = ports.map(function (port) {
    return function (done) {
      const srv = app.listen(port, function () {
        console.log("app running on", port);
        done(null, srv);
      });
    };
  });

  async.parallel(asyncTasks, function (err, apps) {
    servers = apps;
    cb();
  });
}

function stop(cb) {
  cb = cb || _noop;

  async.parallel(
    servers.map(function (server) {
      return function (done) {
        server.close(function () {
          console.log("server killed");
          done();
        });
      };
    }),
    function () {
      cb();
    }
  );
}

module.exports = {
  start: function () {
    return new Promise(function (done) {
      start(function () {
        done();
      });
    });
  },
  stop: function () {
    return new Promise(function (done) {
      stop(function () {
        done();
      });
    });
  },
};
