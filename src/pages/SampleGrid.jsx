import React from 'react'
import Wrapper from '../layouts/Wrapper'
import { Col, Row } from 'reactstrap'

const SampleGrid = () => {
    return (
        <Wrapper>
            <Row>
            <Col lg={8} md={6}>
                <div className="order-desc-info-box">
                    <h3>Order ID: 44</h3>
                    <h5>
                        <span>Order Placed:</span>
                    </h5>
                    <div className="order-cus-details">
                        <h4>
                            sample
                        </h4>
                        <p className="order-cus-email"></p>
                    </div>
                    {/* <hr /> */}
                    <div className="order-cus-details">
                        <h4>Address</h4>


                        <p className="order-cus-address" >

                        </p>

                    </div>
                </div>
            </Col>
            <Col lg={4} md={6}>
                <div className="order-price-box">

                    <div className="order-price-info-box" >
                        <div className="order-price-details">
                            <h5></h5>
                            <p className="qty">
                                0
                            </p>
                        </div>
                        <div className="order-price-details">
                            <h5>$</h5>
                        </div>
                    </div>

                    <div className="order-price-total-box">
                        <div className="order-price-details">
                            <h5 className="subtotal">Sub Total</h5>
                        </div>
                        <div className="order-price-details">
                            <h5 className="subtotal">$</h5>
                        </div>
                    </div>
                    <div className="order-price-info-box">
                        <div className="order-price-details">
                            <h5 className="shipping">Shipping</h5>
                        </div>
                        <div className="order-price-details">
                            <h5 className="subtotal-price">$0</h5>
                        </div>
                    </div>
                    <div className="order-price-info-box">
                        <div className="order-price-details">
                            <h5 className="shipping">Sales Tax</h5>
                        </div>
                        <div className="order-price-details">
                            <h5 className="subtotal-price">$0</h5>
                        </div>
                    </div>
                    <div className="order-price-total-box">
                        <div className="order-price-details">
                            <h5 className="subtotal">TOTAL</h5>
                        </div>
                        <div className="order-price-details">
                            <h5 className="subtotal">$</h5>
                        </div>
                    </div>
                </div>
            </Col>
        </Row></Wrapper>
    )
}

export default SampleGrid