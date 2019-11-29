import React, { useEffect, useState } from 'react'
import Log from './components/Log'
import {Tag, Icon} from 'antd'
import MyTable from './components/MyTable'
const customTitlebar = require('custom-electron-titlebar')
const app = require('electron').remote.app

import soundServer from './SoundServer'
import soundPlayer from './SoundPlayer'

// to debug renderer process with vscode follow 
// https://blog.matsu.io/debug-electron-vscode

// main layout flex + scroll in children taken from:
// https://medium.com/@stephenbunch/how-to-make-a-scrollable-container-with-dynamic-height-using-flexbox-5914a26ae336

// install custom title bar
new customTitlebar.Titlebar({
  backgroundColor: customTitlebar.Color.fromHex('#24292E')
});

soundServer.on('play', (time, sounds) => {
  soundPlayer.play_sounds(sounds);
})

const columns = [
  {
    title: 'Channel',
    dataIndex: 'channel',
    key: 'channel',
    size: 4
  },
  {
    title: 'Main sound',
    dataIndex: 'main',
    key: 'main',
    size: 6,
    render: data =>
      data.cur === 'pre'
        ?
        <Tag>{data.main}</Tag>
        :
        <Tag color='geekblue'>{data.main}</Tag>
  },
  {
    title: 'Pre Sound',
    dataIndex: 'pre',
    key: 'pre',
    size: 6,
    render: data =>
      data.pre
        ?
        data.cur === 'pre'
          ?
          <Tag color='geekblue'>{data.pre}</Tag>
          :
          <Tag>{data.pre}</Tag>
        :
        <span style={{ color: '#e8e8e8' }}>no</span>
  },
  {
    title: 'Volume',
    dataIndex: 'vol',
    key: 'vol',
    size: 4
  },
  {
    title: 'Looped',
    dataIndex: 'loop',
    key: 'loop',
    size: 4,
    render: data =>
      (data.loop) ? <Icon type="sync" spin /> : <Icon style={{ color: '#e8e8e8' }} type="stop" />
  }
];

const App = () => {
  const [sounds, setSounds] = useState([]); // sound list

  const onPlay = (e) => {
    const data = e.detail;

    const newEntry = {
      key: data.sound.idx,
      channel: data.sound.idx,
      main: data.sound.main_name,
      pre: data.sound.pre_name,
      cur: data.is_presound ? 'pre' : 'main',
      vol: data.sound.volume * 100,
      loop: data.sound.looped
    };

    setSounds(sounds => sounds.concat(newEntry));
  }

  const onStop = (e) => {
    const channel = e.detail.sound.idx;

    setSounds(sounds => sounds.filter(sound => sound.channel !== channel));
  }

  const onVolume = (e) => {
    const idx = e.detail.sound.idx;
    const volume = e.detail.sound.volume * 100;

    setSounds(sounds =>
      sounds.map(sound => sound.key === idx ? { ...sound, vol: volume } : sound)
    );
  }

  const onMain = (e) => {
    const idx = e.detail.sound.idx;

    setSounds(sounds =>
      sounds.map(sound => sound.key === idx ? { ...sound, cur: 'main' } : sound)
    )
  }

  const onLoop = (e) => {
    const idx = e.detail.sound.idx;
    const loop = e.detail.sound.looped;

    setSounds(sounds =>
      sounds.map(sound => sound.key === idx ? { ...sound, loop } : sound)
    )
  }

  // setup sound player & sound server on first render
  useEffect(() => {
    const dir = app.getAppPath();
    soundPlayer.readConfig(dir + '/sounds/sound_list.json', './sounds/');
    soundServer.bind(4455);
  }, []);

  // setup event listeners 
  useEffect(() => {
    soundPlayer.addEventListener('play', onPlay);
    soundPlayer.addEventListener('stop', onStop);
    soundPlayer.addEventListener('volume', onVolume);
    soundPlayer.addEventListener('main_sound', onMain);
    soundPlayer.addEventListener('loop', onLoop);

    return () => {
      soundPlayer.removeEventListener('play', onPlay);
      soundPlayer.removeEventListener('stop', onStop);
      soundPlayer.removeEventListener('volume', onVolume);
      soundPlayer.removeEventListener('main_sound', onMain);
      soundPlayer.removeEventListener('loop', onLoop);
    }
  }, [sounds]);

  return (
    <div className='container'>
      <MyTable
        className='section h60'
        locale={{ emptyText: ' ' }}
        dataSource={sounds}
        columns={columns}
        pagination={false}
        scroll={{ y: true }}
      />
      <div className='divider flex_no_shrink' />
      <Log className='h30 scrollable-content pad-left' />
    </div>
  )
}

export default App