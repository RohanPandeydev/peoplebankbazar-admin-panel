import React from 'react'
import BlogList from '../component/blog/BlogList'
import Wrapper from '../layouts/Wrapper'
import { Button } from 'reactstrap'
import { NavLink, useNavigate } from 'react-router-dom'
import { ProtectedMethod } from '../guard/RBACGuard'
import { MdArrowBackIos } from 'react-icons/md'
import { IoMdAdd } from 'react-icons/io'


const Blog = () => {

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
                    <h1>Blog List</h1>
                </div>
                <ProtectedMethod moduleName={"blog"} action='create'>
                    <NavLink to={"/cms/blog/add"} className="blog-add-button">
                        <Button type='button' className='back-button'><IoMdAdd />Add</Button>
                    </NavLink>
                </ProtectedMethod>
            </div>
            <BlogList />
        </Wrapper>
    )
}

export default Blog