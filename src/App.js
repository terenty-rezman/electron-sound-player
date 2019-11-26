import React, { useEffect } from 'react'
import Log from './components/Log'
import sound_server from './SoundServer'
import { Table, Row, Col } from 'antd'
import MyTable from './components/MyTable'
const customTitlebar = require('custom-electron-titlebar');

// to debug renderer process with vscode follow 
// https://blog.matsu.io/debug-electron-vscode

// install custom title bar
new customTitlebar.Titlebar({
  backgroundColor: customTitlebar.Color.fromHex('#222')
});

sound_server.on('play', (time, sounds) => {

})


const data = [];
for (let i = 0; i < 20; i++) {
  data.push({
    key: i,
    name: `Edward King ${i}`,
    age: 32,
    address: `London, Park Lane no. ${i}`,
  });
}

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
];

const App = () => {

  // start udp on first page render
  useEffect(() => {
    sound_server.bind(4455);
  }, []);

  return (
    <div className='container' onClick={() => { console.log(new Date()) }}>
      <MyTable 
        className='section' 
        locale={{ emptyText: ' ' }} 
        dataSource={data} 
        columns={columns} 
        pagination={false}
        scroll={{ y: 100 }}
      />
      <Log className='h30 scrollable-content'/>
    </div> 
  )
}

export default App