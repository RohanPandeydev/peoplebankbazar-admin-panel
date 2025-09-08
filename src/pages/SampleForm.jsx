import React from 'react'
import Wrapper from '../layouts/Wrapper'
import { Button, Col, Form, FormGroup, Input, Label, Row } from 'reactstrap'

const SampleForm = () => {
  return (
    <Wrapper> <h1>"Create Sample Config"</h1>
    <Form >
      <Row>
        <Col md="6" className="mb-2">
          <FormGroup className="common-formgroup">
            <Label> Min. Amount *</Label>
            <Input
              id="minAmount"
              name="minAmount"
             
              placeholder="Enter Min amount"
              type="text"
            
            />
           
          </FormGroup>
        </Col>
   

        <Col md="12" className="mb-2">
          <FormGroup className="common-formgroupn">
            <Button
            
              className="btn btn-style1 px-4 py-2"
              type="submit"
            >
             
                Submit
           
            </Button>
          </FormGroup>
        </Col>
      </Row>
    </Form>
    </Wrapper>
  )
}

export default SampleForm