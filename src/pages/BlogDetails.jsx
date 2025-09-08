import React, { useEffect, useState } from 'react'
import Wrapper from '../layouts/Wrapper'
import { Button, Col, Row } from 'reactstrap'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import BlogDetail from '../component/blog/BlogDetail'
import ProtectedRoute, { ProtectedMethod } from '../guard/RBACGuard'
const BlogDetails = () => {
  const { slug } = useParams()
  const [decodeSlug, setDecodeSlug] = useState(false)
  const navigate = useNavigate()









  useEffect(() => {
    try {
      const decodeSlug = slug && atob(slug);
      console.log("decodeSlug", !!slug, slug);

      slug && setDecodeSlug(() => decodeSlug || "");
    } catch (error) {
      // console.error("Error decoding user ID:", error.message);
      // Handle the error gracefully, e.g., display an error message to the user
      navigate(-1)
    }
  }, [slug]);
  return (
    <Wrapper>
      <Row>
        <Col md={2}>
          {/* <ProtectedMethod moduleName={"blog"} action='update'>
            <NavLink to={`/cms/blog/update/${btoa(decodeSlug)}`}>
              <Button color="primary" size="sm">Edit</Button>
            </NavLink>
          </ProtectedMethod> */}
        </Col>



      </Row>
      <BlogDetail decodeSlug={decodeSlug} />






    </Wrapper>
  )
}

export default BlogDetails