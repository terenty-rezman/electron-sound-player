import React, {useState, useEffect} from 'react'

import { Slider, Tooltip, Popover } from 'antd';

import './ControlPanel.css'

const ControlPanel = ({masterVolume, setMasterVolume, setMasterMuted}) => {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(masterVolume);

  const handleMuteClicked = () => setMuted(muted => !muted);

  const mute_btn_class = `btn-like-ant ${muted ? 'toggled' : ''}`;

  const onVolumeChanged = value => setVolume(value);

  useEffect(() => {
      setMasterVolume(volume);
  }, [volume]);

  useEffect(() => {
      setMasterMuted(muted);
  }, [muted]);

  const popoverContent = (
    <div>
      <Slider
        min={0}
        max={100}
        value={volume}
        tooltipVisible={false}
        onChange={onVolumeChanged}
      />
    </div>
  );

  return (
    <div className='control-panel'>
      <Popover content={popoverContent} title="Master Volume" trigger="click">
        <div className='btn-like-ant'>
          <span className="icon" style={{ marginRight: '15px' }}>{'\uE767'}</span>
          <span style={{minWidth: '25px'}}>{volume}</span>
        </div>
      </Popover>
      <Tooltip title='muted' visible={muted ? true : false}>
        <div className={mute_btn_class} onClick={handleMuteClicked} danger=''>
          <span className="icon">{'\uE74F'}</span>
        </div>
      </Tooltip>
    </div>
  )
}

export default ControlPanel;