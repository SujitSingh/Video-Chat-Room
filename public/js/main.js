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
  audio: true,
}).then(stream => {
  addUserVideoStream(myVideo, stream, true);

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
}).catch(error => {
  console.error('Failed to get local stream', error);
});

function addUserVideoStream(video, stream, enableControl) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  addVideoPlayerOnView(video, enableControl);
}

function addVideoPlayerOnView(video, enableControl) {
  const container = document.createElement('div');
  container.classList.add('video-holder');
  const videoId = video.id || peer.id;
  container.append(video);
  if (enableControl) {
    // add controller elements
    video.id = videoId;
    const controls = `<div class="video-controls">
                        <button onclick="toggleAudio(event, '${videoId}')">Mute</button>
                        <button onclick="toggleVideo(event, '${videoId}')">Disable Video</button>
                      </div>`;
    container.insertAdjacentHTML('beforeend', controls);
  }
  videoContainer.append(container);
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

function toggleVideo(event, videoId) {
  const video = document.getElementById(videoId);
  const disableVideoTxt = 'Disable Video',
        enableVideoTxt = 'Enable Video',
        activeClassName = 'enabled';
  if (event.target.classList.contains(activeClassName)) {
    // show video
    // video.muted = false;
    navigator.mediaDevices.getUserMedia({
      video: true,
    });
    event.target.innerText = disableVideoTxt;
    event.target.classList.remove(activeClassName);
  } else {
    // hide video
    navigator.mediaDevices.getUserMedia({
      video: false,
    });
    event.target.innerText = enableVideoTxt;
    event.target.classList.add(activeClassName);
  }
}

async function toggleAudio(event, videoId) {
  const video = document.getElementById(videoId);
  const muteTest = 'Mute',
        activeClassName = 'enabled';
  if (event.target.classList.contains(activeClassName)) {
    // enable audio
    // video.muted = false;
    const res = await navigator.mediaDevices.getUserMedia();
    // navigator.mediaDevices.getUserMedia({
    //   audio: false,
    // });
    event.target.innerText = muteTest;
    event.target.classList.remove(activeClassName);
  } else {
    // mute audio
    // video.muted = true;
    // navigator.mediaDevices.getUserMedia({
    //   audio: true,
    // });
    const res = await navigator.mediaDevices.getUserMedia();
    event.target.innerText = `Un-${muteTest}`;
    event.target.classList.add(activeClassName);
  }
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