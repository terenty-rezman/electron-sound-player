import React, { useEffect } from 'react'


import './Titlebar.css'

// taken from https://github.com/binaryfunt/electron-seamless-titlebar-tutorial
// SegoeUI symbol table https://docs.microsoft.com/en-us/windows/uwp/design/style/segoe-ui-symbol-font

const remote = require('electron').remote;

let win = null; // just in case it might get gc'ed but im not sure if this is possible

const Titlebar = () => {

  const maximize = () => {
    win.maximize();
  }

  const minimize = () => {
    win.minimize();
  }

  const restore = () => {
    win.unmaximize();
  }

  const close = () => {
    win.close();
  }

  // not react style but im being too lazy to fix
  const toggleMaxRestoreButtons = () => {
    const titlebar = document.getElementById('titlebar');

    if (win.isMaximized()) {
      titlebar.classList.add('maximized');
    } else {
      titlebar.classList.remove('maximized');
    }
  }

  // on first mount
  useEffect(() => {
    win = remote.getCurrentWindow();
    win.addListener('maximize', toggleMaxRestoreButtons);
    win.addListener('unmaximize', toggleMaxRestoreButtons);

    return () => {
      win.removeListener('maximize', toggleMaxRestoreButtons);
      win.removeListener('unmaximize', toggleMaxRestoreButtons);
      win = null;
    }
  }, [])

  return (
    <header id="titlebar">
      <div id="drag-region">
        <div id='window-resize-top'></div>
        <div id='window-resize-left'></div>
        <div id='window-icon'>
          <span>{'\uE7F6'}</span>
        </div>
        <div id="window-title">
          Sound Player
        </div>
        <div id="window-controls">
          <div className="button" id="min-button" onClick={minimize}>
            <span>{'\ue921'}</span>
          </div>
          <div className="button" id="max-button" onClick={maximize}>
            <span>{'\ue922'}</span>
          </div>
          <div className="button" id="restore-button" onClick={restore}>
            <span>{'\ue923'}</span>
          </div>
          <div className="button" id="close-button" onClick={close}>
            <span>{'\ue8bb'}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Titlebar