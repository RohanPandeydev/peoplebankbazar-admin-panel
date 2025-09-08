import Wrapper from '../layouts/Wrapper'
import { Button } from 'reactstrap'
import { NavLink, useNavigate } from 'react-router-dom'
import { IoMdAdd } from 'react-icons/io'
import BankList from '../component/bank/BankList'
import AlsoBuyList from '../component/alsobuy/AlsoBuyList'


const AlsoBuy = () => {

    const nav = useNavigate()
    const handleBack = () => {
        nav(-1)
    }

    return (
        <Wrapper>
            <div className="blog-header">
                <div className="admin-heading-header">
                    {/* <Button className="back-button" type="click" onClick={handleBack}>
                        <MdArrowBackIos />Back</Button> */}
                    {/* <h1>Also Buy List</h1> */}
                </div>
                <NavLink to={"/promotions/also-buy/add"} className="blog-add-button">
                    <Button type='button' className='back-button'><IoMdAdd />Add</Button>
                </NavLink>
            </div>
            <AlsoBuyList />
        </Wrapper>
    )
}

export default AlsoBuy