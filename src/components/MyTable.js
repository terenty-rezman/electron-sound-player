import React from 'react'

import { Row, Col } from 'antd'

const MyTable = (props) => {

  const column_headers = props.columns.map((column, index) => <Col span={8} key={column.dataIndex}>{column.title}</Col>);
  const data_keys = props.columns.map(column => column.key);

  let data_rows = props.dataSource.map(row => {
    return (
      <Row key={row.key} className='table-item'>
        {
          data_keys.map(key =>
            <Col span={8} key={key}>{row[key]}</Col>
          )
        }
      </Row>
    )
  })

  return (
    <div className={props.className}>
        {/* <table>
          <thead>
            <tr>{column_headers}</tr>
          </thead>
        </table> */}
        <Row className='content'>
          {column_headers}
        </Row>
        <div className='scrollable-content'>
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