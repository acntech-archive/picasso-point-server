'use strict';

var ws = require('ws');
var WebSocketServer = ws.Server;
var http = require('http');
var express = require('express');
var _ = require('lodash');
var jrc = require('just.randomcolor');
var app = express();
var inputPort = process.env.PORT || 5000;

var uniqueUsers = [];

app.use(express.static(__dirname + '/'));

var inputServer = http.createServer(app);
var outputServer = http.createServer(app);
inputServer.listen(inputPort);

var wsServer = new WebSocketServer({
  server: inputServer
});

var clients = [];

function doesUserExist(user) {
  return _.pluck(uniqueUsers, {
    user: user
  });
}

wsServer.on('connection', function (ws) {
  console.log('websocket input got connection');

  if (ws.protocol === 'client') {
    clients.push(ws);
    console.log('websocket get a client');
  }

  ws.on('close', function () {
    console.log('websocket connection close');
  });

  ws.on('message', function (msg) {
    console.log(msg);
    var user = JSON.parse(msg).user;

    /* jshint camelcase: false */
    _(clients)
      .filter(function (e) {
        return e.protocol === 'client';
      })
      .each(function (e) {
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
          console.log('sending message');
        } catch (e) {
          console.log('ohnnoes:' + e);
        }
      });
  });
});
