
import React from 'react'
import { Col, Row } from 'reactstrap'
import { AiOutlineFileSearch } from 'react-icons/ai'


const NoDataFound = ({ msg }) => {
  return (
    <>
      <Row>
        <Col xs="12" lg="6" className="offset-lg-3">
          <div className="no-data-wrap">
           
            <div className="no-data-img">
                <AiOutlineFileSearch />
            </div>
            <h3>{msg || "There is no active data found"}</h3>
          </div>
        </Col>
      </Row>
    </>
  )
}

export default NoDataFound