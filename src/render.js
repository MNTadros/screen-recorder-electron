// Grabbing elements
const videoElement = document.querySelector("video");
const startButton = document.querySelector("startButton");
const stopButton = document.querySelector("stopButton");
const videoSelectButton = document.getElementById('videoSelectButton');
videoSelectButton.onclick = getVideoSources;

const { desktopCapturer} = require('electron');
const remote = require('@electron/remote');

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