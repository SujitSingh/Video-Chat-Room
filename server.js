const express = require('express');
const http = require('http');
const { v4: uuid4 } = require('uuid');

const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);
const PORT = 3080;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  const roomId = uuid4();
  res.redirect(`/${roomId}`);
});
app.get('/:roomId', (req, res) => {
  res.render('room', { roomId: req.params.roomId });
});

server.listen(PORT, () => {
  console.log(`Server running at http:127.0.0.1:${PORT}`);
}).on('error', err => {
  console.log('Server starting error -', err);
});