import React from 'react'
import Wrapper from '../layouts/Wrapper'
import { Table } from 'reactstrap'

const Sample = () => {
    return (
        <Wrapper>
            <div className="member-view-wrapper">
                <div className="common-db-head mb-4">
                <div className="common-table">
                    <Table responsive>
                        <thead>
                            <tr>
                                <th className="prod-name">Min Amount</th>
                                <th className="description">Coin Per Currency Unit</th>

                            </tr>
                        </thead>
                        <tbody>

                            <tr >

                                <td>Sample</td>
                                <td>Sample</td>

                            </tr>
                            <tr >

                                <td>Sample</td>
                                <td>Sample</td>

                            </tr>
                            <tr >

                                <td>Sample</td>
                                <td>Sample</td>

                            </tr>
                            <tr >

                                <td>Sample</td>
                                <td>Sample</td>

                            </tr>

                        </tbody>
                    </Table>
                    </div>
                </div>
            </div>
        </Wrapper>
    )
}

export default Sample   