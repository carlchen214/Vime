var db = require('./db/db');
var express = require('express');
var bodyParser = require('body-parser');
var router = require('./routes');

var app = express();
app.port = process.env.PORT || 3000;
var server = app.listen(app.port, function() {
  console.log('we are listening!');
});

//app.io = require('socket.io')(server);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/../client/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//middleware for routes
//https://expressjs.com/en/guide/routing.html
app.use('/', router);


io.on('connection', function(socket){
  console.log('\nUSER CONNECTED\n');
  app.socket=socket;
  socket.on('disconnect', function(){
    console.log('\nUSER DISCONNECTED\n');
  })
  socket.on('some message', function(msg){
    console.log('A client sent you a msg:', msg);
    console.log('Let\'s tell everyone else hi');
    socket.broadcast.emit('someone else','hi');
  });
});
