import Wrapper from '../layouts/Wrapper'
import { Button } from 'reactstrap'
import { NavLink, useNavigate } from 'react-router-dom'
import { IoMdAdd } from 'react-icons/io'
import CategoryList from '../component/category/CategoryList'
import CmsList from '../component/cms/CmsList'


const CategoryCms = () => {

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
                    {/* <h1>Bank Cms List</h1> */}
                </div>
                    <NavLink to={"/cms/category-listing/add"} className="blog-add-button">
                        <Button type='button' className='back-button'><IoMdAdd />Add</Button>
                    </NavLink>
            </div>
            <CmsList page_type={"category_listing"} />
        </Wrapper>
    )
}

export default CategoryCms