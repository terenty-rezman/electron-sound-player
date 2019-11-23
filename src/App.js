import React, {useEffect} from 'react'
import Log from './components/Log'
import sound_server from './SoundServer'
const customTitlebar = require('custom-electron-titlebar');

// to debug renderer process with vscode follow 
// https://blog.matsu.io/debug-electron-vscode

// install custom title bar
new customTitlebar.Titlebar({
  backgroundColor: customTitlebar.Color.fromHex('#fff')
});

sound_server.on('play', (time, sounds) => {
  
})

const App = () => {

  // start udp on first page render
  useEffect(() => {
    sound_server.bind(4455);
  }, []);

  return (
    <div className='container' onClick={()=>{console.log(new Date())}}>
      <Log />
    </div>
  )
}

export default App