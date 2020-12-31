const express = require('express');
const http = require('http');
const { v4: uuid4 } = require('uuid');
const { ExpressPeerServer } = require('peer');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT ||3080;

app.enable('trust proxy');
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  const roomId = uuid4();
  res.redirect(`/${roomId}`);
});
app.get('/:roomId', (req, res) => {
  res.render('room', { roomId: req.params.roomId });
});

// registering peer-server route
const peerServer = ExpressPeerServer(server, {
  path: '/peer' // host/peerjs/peer
});
app.use('/peerjs', peerServer);

io.on('connection', socket => {
  socket.on('room-joined', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-joined', userId); // notify existing users
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
}).on('error', err => {
  console.log('Server starting error -', err);
});