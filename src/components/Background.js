import React from 'react'
import { CSSTransition } from 'react-transition-group'

import './Background.css'

const Background = ({ visible }) => {
    return (
      <CSSTransition
        in={visible}
        timeout={300}
        classNames="appear"
        unmountOnExit
      >
        <div className='background-girl1'></div>
      </CSSTransition>
    )
}

export default Background