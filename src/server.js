'use strict';

var ws = require('ws');
var WebSocketServer = ws.Server;
var http = require('http');
var express = require('express');
var app = express();
var inputPort = 5000;
var outputPort = 5001;

var uniqueUsers = [];
var uniqueColors = ['#abbf72', '#72bf87', '#72bfa2', '#8ebf72', '#72bf96', '#72bfa3', '#bf72a4', '#75bf72', '#bf8672', '#bfbf72', '#72bfa5', '#9f72bf', '#72bfaf', '#7872bf', '#bf727e', '#72a0bf', '#bf7279', '#a572bf', '#72bf7b', '#7299bf'];

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

wssOutput.on('connection', function (ws) {

  clients.push(ws);
  console.log('websocket output got connection');

  ws.on('close', function () {
    console.log('websocket connection close');
  });

  ws.on('message', function (msg) {
    var parsedMsg = JSON.parse(msg);

    clients.forEach(function (e) {
      try {
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
    console.log('msg from drawer');
    console.log(msg);
    connection.send(msg);
    var user = JSON.parse(msg).user;
    if (user) {
      var newUser = {
        user: user + '#' + uniqueUsers.length,
        color: uniqueColors[uniqueUsers.length]
      };
      console.log('Created user: ' + newUser.user);
      uniqueUsers.push(newUser);
      ws.send(JSON.stringify(newUser));
    }
  });
});
