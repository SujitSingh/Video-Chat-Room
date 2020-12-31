const socket = io('/');
const peer = new Peer(undefined, {
  host: 'localhost', port: 3080, path: '/peerjs/peer'
});

peer.on('open', id => {
  socket.emit('room-joined', roomId, id); // inform others about room joining
});

socket.on('user-joined', userId => {
  // listen for new user's joining
  console.log('New user joined', userId);
});