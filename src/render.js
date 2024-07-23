// Grabbing elements
let videoTypesTuples = {
  'video/mp4; codecs=vp9': '.mp4',
  'video/webm; codecs=vp9': '.webm',
  'video/mov; codecs=vp9': '.mov'
};
let keys = Object.keys(videoTypesTuples);
let selectedIndex = 0;

const videoElement = document.querySelector("video");
const videoSelectButton = document.getElementById('videoSelectButton');
videoSelectButton.onclick = getVideoSources;
let mediaRecorder; 
const recordedChunks = [];
const { desktopCapturer, remote } = require('electron');
const { dialog , Menu } = remote;
const { writeFile } = require("fs");

function updateSwitchButtonText() {
  switchButton.innerText = `(${videoTypesTuples[keys[selectedIndex]]})`;
}

switchButton.onclick = () => {
  selectedIndex = (selectedIndex + 1) % keys.length;
  updateSwitchButtonText();
};
// Button functionality
const startButton = document.getElementById('startButton');
startButton.onclick = e => {
  mediaRecorder.start();
  startButton.classList.add('is-danger');
  startButton.innerText = 'Recording';
};

const stopButton = document.getElementById('stopButton');
stopButton.onclick = e => {
  mediaRecorder.stop();
  startButton.classList.remove('is-danger');
  startButton.innerText = 'Start';
};

function handleDataAvailable(e) {
  console.log('Video data available!');
  recordedChunks.push(e.data);
}

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

async function handleStop(e){
  const blob = new Blob(recordedChunks,{
    type: keys[selectedIndex]
    });

  const buffer = Buffer.from(await blob.arrayBuffer());

  const{ filePath } = await dialog.showSaveDialog({
    buttonLabel: 'Save Video',
    defaultPath: `vid-${Date.now()}${videoTypesTuples[keys[selectedIndex]]}`
  });
  console.log(filePath );
  if (filePath ) {
    writeFile(filePath, buffer, () => console.log('video saved successfully!'));
  }
}