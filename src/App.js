import React, { useEffect, useState } from 'react'
import Log from './components/Log'
import { Tag, Icon, Button, Result } from 'antd'

import MyTable from './components/MyTable'
import Statusbar from './components/Statusbar'
import ControlPanel from './components/ControlPanel'
import Background from './components/Background'
import MainWindow from './components/MainWindow'

import utils from './utils'

import soundServer from './SoundServer'
import soundPlayer from './SoundPlayer'

const remote = require('electron').remote;

// to debug renderer process with vscode follow 
// https://blog.matsu.io/debug-electron-vscode

// main layout flex + scroll in children taken from:
// https://medium.com/@stephenbunch/how-to-make-a-scrollable-container-with-dynamic-height-using-flexbox-5914a26ae336

// setting app icon https://github.com/electron-userland/electron-builder/issues/2577#issuecomment-384690260

let win = null; // global just in case it might get gc'ed but im not sure if this is possible

soundServer.on('play', (time, sounds) => {
  soundPlayer.play_sounds(time, sounds);
})

soundServer.on('play_by_name', (name, volume, looped) => {
  soundPlayer.play_sound_by_name(name, volume, looped);
})

soundServer.on('stop_by_name', (name) => {
  soundPlayer.stop_sound_by_name(name);
})

soundServer.on('stop_all_sounds', () => {
  soundPlayer.stop_all();
})

const columns = [
  {
    title: 'Channel',
    dataIndex: 'channel',
    key: 'channel',
    size: 3,
    render: data => data.channel + 1
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
        <span>no</span>
  },
  {
    title: 'Volume',
    dataIndex: 'vol',
    key: 'vol',
    size: 3
  },
  {
    title: 'Looped',
    dataIndex: 'loop',
    key: 'loop',
    size: 3,
    render: data =>
      (data.loop) ? <Icon type="sync" spin /> : <span>no</span> /*<Icon style={{ color: '#999999' }} type="stop" />*/
  },
  {
    title: 'Priority',
    dataIndex: 'pri',
    key: 'priority',
    size: 3
  }
];

const App = () => {
  const [sounds, setSounds] = useState([]); // sound list
  const [address, setAddress] = useState(null); // udp sound server address it's listening on
  const [udpTimeStamp, setUdpTimeStamp] = useState(0); // every udp received has some time stamp to indicate that something is going on
  const [backgroundVisible, setBackgroundVisible] = useState(false);
  const [page, setPage] = useState(0);

  const onListen = (e) => {
    setAddress(soundServer.address());
  }

  const onPlay = (e) => {
    const data = e.detail;

    const newEntry = {
      key: data.sound.idx,
      channel: data.sound.idx,
      main: data.sound.main_name,
      pre: data.sound.pre_name,
      cur: data.is_presound ? 'pre' : 'main',
      vol: Math.trunc(data.sound.volume * 100),
      loop: data.sound.looped,
      priority: data.sound.priority
    };

    setSounds(sounds => sounds.concat(newEntry));
  }

  const onStop = (e) => {
    const channel = e.detail.sound.idx;

    setSounds(sounds => sounds.filter(sound => sound.channel !== channel));
  }

  const onVolume = (e) => {
    const idx = e.detail.sound.idx;
    const volume = Math.trunc(e.detail.sound.volume * 100);

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

  const onTime = (e) => {
    const time = e.detail.time;
    setUdpTimeStamp(Number.parseFloat(time).toFixed(2));
  }

  const handleBackgroundVisible = () => {
    setBackgroundVisible(visible => !visible);
  }

  const handleDevTools = () => {
    win.webContents.openDevTools();
  }

  const showSettingsFile = () => {
    const dir = utils.getWorkingDir();
    let settings = dir + '/settings.json';
    remote.shell.showItemInFolder(settings);
  }

  const showSoundListFile = () => {
    const dir = utils.getWorkingDir();
    let sound_list_file = dir + '/sounds/sound_list.json';
    remote.shell.showItemInFolder(sound_list_file);
  }
  
  // setup event listeners 
  useEffect(() => {
    soundPlayer.addEventListener('play', onPlay);
    soundPlayer.addEventListener('stop', onStop);
    soundPlayer.addEventListener('volume', onVolume);
    soundPlayer.addEventListener('main_sound', onMain);
    soundPlayer.addEventListener('loop', onLoop);
    soundPlayer.addEventListener('time', onTime);

    soundServer.addListener('listening', onListen);

    return () => {
      soundPlayer.removeEventListener('play', onPlay);
      soundPlayer.removeEventListener('stop', onStop);
      soundPlayer.removeEventListener('volume', onVolume);
      soundPlayer.removeEventListener('main_sound', onMain);
      soundPlayer.removeEventListener('loop', onLoop);
      soundPlayer.removeEventListener('time', onTime);

      soundServer.removeListener('listening', onListen);
    }
  }, []);

  // setup sound player & sound server on first render
  useEffect(() => {
    const dir = utils.getWorkingDir();
    let settings = utils.readSettingsFile(dir + '/settings.json');

    if (!settings) {
      settings = {
        listen_address: "0.0.0.0",
        listen_port: 4455,
        max_sounds: 10,
        sound_kill_interval_secs: 3
      }
    }

    soundPlayer.setMaxSounds(settings.max_sounds);

    soundPlayer.loadSoundFiles(dir + '/sounds/sound_list.json', dir + '/sounds/');
    soundPlayer.set_auto_stop_in(Number.parseFloat(settings.sound_kill_interval_secs) * 1000);
    soundServer.start_listen(settings.listen_port, settings.listen_address);
  }, []);

  // get current browser window
  useEffect(() => {
    win = remote.getCurrentWindow();
    // win.webContents.openDevTools();
  }, []);

  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: backgroundVisible ? 'Hide Background' : 'Show Background',
          click: handleBackgroundVisible
        },
        {
          label: "Show settings.json",
          click: showSettingsFile
        },
        {
          label: "Show sound_list.json",
          click: showSoundListFile
        },
        {
          label: 'Developer tools',
          click: handleDevTools
        }
      ]
    }
    ,
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => setPage(1)
        }
      ]
    }
  ]

  return (
    <MainWindow menuTemplate={menuTemplate} currentPageIndex={page}>
      <div className='container'>
        <Background visible={backgroundVisible} />
        <MyTable
          className='section h60'
          dataSource={sounds}
          columns={columns}
        />
        <div className='divider flex_no_shrink'>
          <ControlPanel
            masterVolume={soundPlayer.getMasterVolume()}
            setMasterVolume={soundPlayer.setMasterVolume}
            setMasterMuted={soundPlayer.setMasterMuted}
          />
        </div>
        <Log className='h30 scrollable-content pad-left log' />
        <Statusbar address={address} time={udpTimeStamp} />
      </div>
      <div className='container flex-center'>
        <Result
          icon={<Icon type="customer-service" theme="twoTone" />}
          title="Sound Player"
          subTitle="All models are of age of 18."
          extra={<Button type="primary" onClick={()=>setPage(0)}>Back</Button>}
        />
      </div>
    </MainWindow>
  )
}

export default App
