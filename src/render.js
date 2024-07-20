// Grabbing elements
const videoElement = document.querySelector("video");
const startButton = document.querySelector("startButton");
const stopButton = document.querySelector("stopButton");
const videoSelectButton = document.getElementById('videoSelectButton');
videoSelectButton.onclick = getVideoSources;

let mediaRecorder; 
const recordedChunks = [];
const { desktopCapturer, remote } = require('electron');
const { Menu } = remote;

async function getVideoSources() {
  const inputSources = await desktopCapturer.getSources({
    types: ['window', 'screen']
  });

  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map(source => {
      return {
        label: source.name,
        click: () => selectSource(source)
      };
    })
  );


  videoOptionsMenu.popup();
}

async function selectSource(source) {
  videoSelectButton.innerText = source.name;
  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id
      }
    }
  };
  // Create a Stream
  const stream = await navigator.mediaDevices
  .getUserMedia(constraints);

  // Preview the source in a video element
  videoElement.srcObject = stream;
  videoElement.play();

  const options = { mimeType: 'video/webm; codecs=vp9' };
  mediaRecorder = new MediaRecorder(stream, options);
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop
}