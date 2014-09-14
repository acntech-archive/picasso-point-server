'use strict';

var ws = require('ws');
var WebSocketServer = ws.Server;
var http = require('http');
var express = require('express');
var _ = require('lodash');
var app = express();
var inputPort = process.env.PORT || 5000;

var uniqueUsers = [];
var uniqueColors = ['#abbf72', '#72bf87', '#72bfa2', '#8ebf72', '#72bf96', '#72bfa3', '#bf72a4', '#75bf72', '#bf8672', '#bfbf72', '#72bfa5', '#9f72bf', '#72bfaf', '#7872bf', '#bf727e', '#72a0bf', '#bf7279', '#a572bf', '#72bf7b', '#7299bf'];

app.use(express.static(__dirname + '/'));

app.get('/port-number', function (req, res) {
  res.send(JSON.stringify({ port: inputPort }));
});

var server = http.createServer(app);
server.listen(inputPort);

var wsServer = new WebSocketServer({
  server: server
});

var clients = [], canvases = [];

wsServer.on('connection', function (ws) {
  console.log('websocket input got connection');

  if (ws.protocol === 'client') {
    clients.push(ws);
  } else if (ws.protocol === 'canvas') {
    canvases.push(ws);
  }

  ws.on('close', function () {
    console.log('websocket connection close');
  });

  ws.on('message', function (msg) {
      var parsedMsg = JSON.parse(msg);

      if (parsedMsg.user) {
        var newUser = {
          user: parsedMsg.user + '#' + uniqueUsers.length,
          color: uniqueColors[uniqueUsers.length]
        };
        console.log('Created user: ' + newUser.user);
        ws.send(JSON.stringify(newUser));
      } else if (parsedMsg.userId) {
        canvases.forEach(function (e) {
          try {
            e.send(msg);
            console.log('sending message');
          } catch (e) {
            console.log('ohnnoes:' + e);
          }
        });
      }
      else {
        console.log('sa;dofjbugfdsljhbdwpfiuhbn')
      }
    }
  );
});
