const socket = io('/');

socket.emit('room-joined', roomId, 10); // inform others about room joining

socket.on('user-joined', userId => {
  // listen for new user's joining
  console.log('New user joined', userId);
});