import React, { useEffect, useState } from 'react'

import './Titlebar.css'

// taken from https://github.com/binaryfunt/electron-seamless-titlebar-tutorial
// SegoeUI symbol table https://docs.microsoft.com/en-us/windows/uwp/design/style/segoe-ui-symbol-font

const remote = require('electron').remote;

let win = null; // global just in case it might get gc'ed but im not sure if this is possible

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

const Titlebar = () => {
  const [maximized, setMaximized] = useState(false);

  const toggleMaxRestoreButtons = () => {
    if (win.isMaximized())
      setMaximized(true);
    else
      setMaximized(false);
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
  }, []);

  const middleButton =
    maximized
      ?
      <div className="button" id="restore-button" onClick={restore}>
        <span>{'\ue923'}</span>
      </div>
      :
      <div className="button" id="max-button" onClick={maximize}>
        <span>{'\ue922'}</span>
      </div>
  ;

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
          {middleButton}
          <div className="button" id="close-button" onClick={close}>
            <span>{'\ue8bb'}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Titlebar