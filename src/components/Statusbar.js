import React from 'react'

import './Statusbar.css'

import {Typography, Tag, Icon} from 'antd'
const { Text } = Typography;

const Statusbar = ({address, time}) => {
    const address_str = address ? ` ${address.address}:${address.port}` : null;

    return (
        <div className='status-bar'>
            <span color="" className="item"><Icon type="meh" /> {time}</span>
            <span color="" className="item"><Icon type="link" />{address_str}</span>
            {/* <span color="" className="item"><Icon type="bell" /> 10</span> */}
        </div>
    )
}

export default Statusbar
