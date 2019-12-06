import React from 'react'

import './Statusbar.css'

import {Typography, Tag, Icon} from 'antd'
const { Text } = Typography;

const Statusbar = () => {
    return (
        <div className='status-bar'>
            <span color="" className="item"><Icon type="meh" /> 119.23</span>
            <span color="" className="item"><Icon type="link" /> 0.0.0.0:4455</span>
            <span color="" className="item"><Icon type="bell" /> 10</span>
        </div>
    )
}

export default Statusbar