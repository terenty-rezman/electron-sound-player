import React from 'react'

import { Row, Col } from 'antd'

const MyTable = (props) => {

  const column_headers = props.columns.map((column, index) => <Col span={8} key={column.dataIndex}>{column.title}</Col>);
  const data_keys = props.columns.map(column => column.key);

  const data_rows = props.dataSource.map(row => {
    return (
      <Row key={row.key}>
        {
          data_keys.map(key =>
            <Col span={8} key={key}>{row[key]}</Col>
          )
        }
      </Row>
    )
  })

  return (
    <div className={props.className} style={{display: 'flex', flexDirection:'column'}}>
      <div className='no_scroll' style={{flexShrink: 0}}>
        {/* <table>
          <thead>
            <tr>{column_headers}</tr>
          </thead>
        </table> */}
        <Row>
          {column_headers}
        </Row>
        </div>
        <div className='scroll'>
        {/* <table>
          <tbody>
            {data_rows}
          </tbody>
        </table> */}
        {data_rows}
      </div>
    </div>
  )
}

export default MyTable;