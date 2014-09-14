'use strict';

var ws = require('ws');
var WebSocketServer = ws.Server;
var http = require('http');
var express = require('express');
var _ = require('lodash');
var jrc = require('just.randomcolor');
var app = express();
var inputPort = 5000;
var outputPort = 5001;

var uniqueUsers = [];

app.use(express.static(__dirname + '/'));

var inputServer = http.createServer(app);
var outputServer = http.createServer(app);
inputServer.listen(inputPort);
outputServer.listen(outputPort);

var wssInput = new WebSocketServer({
  server: inputServer
});

var wssOutput = new WebSocketServer({
  server: outputServer
});

var clients = [];

function doesUserExist(user) {
  return _.pluck(uniqueUsers, {
    user: user
  });
}

wssOutput.on('connection', function (ws) {

  clients.push(ws);
  console.log('websocket output got connection');

  ws.on('close', function () {
    console.log('websocket connection close');
  });

  ws.on('message', function (msg) {
    console.log(msg);
    var user = JSON.parse(msg).user;

    /* jshint camelcase: false */
    clients.forEach(function (e) {
      try {
        if (user) {
          if (!doesUserExist(user)) {
            uniqueUsers.push({
              user: user,
              color: new jrc()
            });
          }
        }
        e.send(msg);
      } catch (e) {
        console.log('ohnnoes:' + e);
      }
    });
  });
});

var connection = new ws('ws://localhost:5001');

wssInput.on('connection', function (ws) {
  console.log('websocket input got connection');

  ws.on('close', function () {
    console.log('websocket connection close');
  });

  ws.on('message', function (msg) {
    console.log(msg);
    connection.send(msg);
  });
});
