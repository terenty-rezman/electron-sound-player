import React from 'react'

import './titlebar.css'

// taken from https://github.com/binaryfunt/electron-seamless-titlebar-tutorial
// SegoeUI symbol table https://docs.microsoft.com/en-us/windows/uwp/design/style/segoe-ui-symbol-font

const Titlebar = ({minimize, maximize, restore, close, state}) => {
  return (
    <header id="titlebar">
      <div id="drag-region">
        <div id="window-title">
          <span>electron-react-template</span>
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