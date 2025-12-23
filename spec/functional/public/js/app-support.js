"use strict";

var app = window.app || {};

window.addEventListener(
  "message",
  function (e) {
    console.log(e.data); // eslint-disable-line no-console
  },
  false,
);

app.printToDOM = function (str, id) {
  var p = document.createElement("p");

  p.innerHTML = str;
  p.id = id || new Date().getTime();

  document.body.appendChild(p);
};
