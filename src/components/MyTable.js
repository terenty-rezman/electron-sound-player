import React from 'react'
import { Row, Col } from 'antd'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

import './MyTable.css'

const MyTable = (props) => {

  const colsizes = props.columns.map(column => column.size);

  const column_headers = props.columns.map((column, index) =>
    <Col span={colsizes[index]} key={column.dataIndex}>
      {column.title}
    </Col>
  );

  const keys_renders = props.columns.map(column => [column.key, column.render]);

  let data_rows = props.dataSource.map(row => {
    return (
      <CSSTransition
        timeout={300}
        classNames="fade"
        key={row.key}
        unmountOnExit
      >
        <Row className='table-item'>
          {
            keys_renders.map(([key, render], index) =>
              <Col span={colsizes[index]} key={key} className='table-col'>{(render) ? render(row) : row[key]}</Col>
            )
          }
        </Row>
      </CSSTransition>
    )
  })

  return (
    <div className={props.className}>
      <Row className='table-heading pad-left'>
        {column_headers}
      </Row>
      <TransitionGroup className='scrollable-content pad-left'>
        {data_rows}
      </TransitionGroup>
    </div>
  )
}

export default MyTable;