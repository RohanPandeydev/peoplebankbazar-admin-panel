import Wrapper from '../layouts/Wrapper'
import { Button } from 'reactstrap'
import { NavLink, useNavigate } from 'react-router-dom'
import { IoMdAdd } from 'react-icons/io'
import BankList from '../component/bank/BankList'


const Bank = () => {

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
                    {/* <h1>Bank List</h1> */}
                </div>
                <NavLink to={"/master/banks/add"} className="blog-add-button">
                    <Button type='button' className='back-button'><IoMdAdd />Add</Button>
                </NavLink>
            </div>
            <BankList />
        </Wrapper>
    )
}

export default Bank