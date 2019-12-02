import React, {useState} from 'react'

import { Slider, InputNumber, Button, Row, Col, Popover } from 'antd';

import './ControlPanel.css'

const content = (
  <div>
    <Slider
      min={0}
      max={100}
      tooltipVisible={false}
    />
  </div>
);

const ControlPanel = () => {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(33);

  const handleMuteClicked = () => setMuted(muted => !muted);

  const mute_btn_class = `btn-like-ant ${muted ? 'toggled' : ''}`

  return (
    <div className='control-panel'>
      <Popover content={content} title="Master Volume" trigger="click">
        <div className='btn-like-ant' style={{ marginRight: '15px' }}>
          <span className="icon" style={{ marginRight: '15px' }}>{'\uE767'}</span>
          <span>34</span>
        </div>
      </Popover>
      {/* <span className="icon">{'\uE74F'}</span> */}
      {/* <span className="icon">{'\uE767'}</span> */}
      {/* <span className='btn-text'>D</span> */}
      <div className={mute_btn_class} onClick={handleMuteClicked} danger=''>
        <span className="icon">{'\uE74F'}</span>
      </div>
    </div>
  )
}

export default ControlPanel;