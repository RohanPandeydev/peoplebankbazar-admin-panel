import Wrapper from '../layouts/Wrapper'
import { Button } from 'reactstrap'
import { NavLink, useNavigate } from 'react-router-dom'
import { IoMdAdd } from 'react-icons/io'
import CategoryList from '../component/category/CategoryList'
import CmsList from '../component/cms/CmsList'


const BankCms = () => {

    const nav = useNavigate()
    const handleBack = () => {
        nav(-1)
    }

    return (
        <Wrapper>
            <div className="blog-header">
                {/* <div className="admin-heading-header">
                    
                    <h1>Bank Cms List</h1>
                </div> */}
                    <NavLink to={"/cms/bank-details/add"} className="blog-add-button">
                        <Button type='button' className='back-button'><IoMdAdd />Add</Button>
                    </NavLink>
            </div>
            <CmsList page_type="bank_detail" />
        </Wrapper>
    )
}

export default BankCms