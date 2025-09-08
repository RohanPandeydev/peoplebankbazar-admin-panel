import React from 'react'
import { Link } from 'react-router-dom'
import { Col, Container, Row } from 'reactstrap'
import ImagesPath from '../assets/images/ImagePath'
const PageNotFound = () => {
  return (
    <>
      <section className="pagenotfound-wrapper">
        <Container>
            <Row>
                <Col xs="12" className="text-center">
                    <div className="img-404">
                        <img className="img-fluid" src={ImagesPath.sad} alt="" />
                    </div>
                    <h1 class="error">404</h1>
                    <div class="ooops-text">Ooops!!! The page you are looking for is not found</div>
                    <Link class="btn btn-style1 px-4 py-3 " to="/"> Back to home </Link>
                </Col>
            </Row>
        </Container>
      </section>
    </>
  )
}

export default PageNotFound
