import React from 'react'
import { Dropdown, Menu } from 'antd'

import Titlebar from './Titlebar'
import PageDisplay from './PageDisplay'

const MainWindow = ({ menuTemplate, currentPageIndex, children }) => {

  const menuBar = !menuTemplate ? null : menuTemplate.map((menuBarItem, index) => {

    let submenuItems = null;

    if (menuBarItem.submenu) {
      submenuItems = menuBarItem.submenu.map((submenuItem, index) => {
        return (
          <Menu.Item key={index}>
            <a href="#" onClick={submenuItem.click}>
              {submenuItem.label}
            </a>
          </Menu.Item>
        )
      })
    }

    const submenu =
      <Menu theme="dark">
        {submenuItems}
      </Menu>
    ;

    return (
      <Dropdown overlay={submenu} trigger={['click']} key={index}>
        <span className="menu-item">
          {menuBarItem.label}
        </span>
      </Dropdown>
    )
  })

  return ([
    <Titlebar key={1}>
      {menuBar}
    </Titlebar>,
    <PageDisplay page={currentPageIndex} key={2}>
      {children}
    </PageDisplay>
  ])
}

export default MainWindow