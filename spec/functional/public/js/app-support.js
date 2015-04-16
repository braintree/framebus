'use strict';

var app = window.app || {};

app.printToDOM = function (str, id) {
  var p = document.createElement('p');
  p.innerHTML = str;
  p.id = id || new Date().getTime();

  document.body.appendChild(p);
};
