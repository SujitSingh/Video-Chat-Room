const socket = io('/');
const peer = new Peer(undefined, {
  host: 'localhost', port: 3080, path: '/peerjs/peer'
});

const videoContainer = document.getElementsByClassName('video-grid')[0];

// initialize own video
const myVideo = document.createElement('video');
myVideo.classList.add('own');
myVideo.muted = true;

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: false,
}).then(stream => {
  addUserVideoStream(myVideo, stream);

  socket.on('user-joined', userId => {
    console.log('User joined -', userId);
    sendStreamToUser(userId, stream); // send your stream to the new user
  });

  peer.on('call', call => {
    call.answer(stream);
    const video = document.createElement('video');
    video.id = call.peer;
    call.on('stream', userStream => {
      // joined user's video stream is ready
      addUserVideoStream(video, userStream);
    });
  });
});

function addUserVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoContainer.append(video);
}

function sendStreamToUser(userId, stream) {
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  video.id = userId;
  call.on('stream', userStream => {
    // for new user's video stream
    addUserVideoStream(video, userStream);
  });
  call.on('close', () => {
    // on user disconnection
    video.remove();
  });
}

socket.on('user-disconnected', userId => {
  // user disconnection listener
  console.log('User disconnected -', userId);
  if (peer[userId]) {
    peer[userId].close();
  }
  removeUserVideoPanel(userId);
});

function removeUserVideoPanel(userId) {
  const video = document.getElementById(userId);
  if (video) {
    video.remove();
  }
}

peer.on('open', id => {
  socket.emit('room-joined', roomId, id); // inform others about room joining
});