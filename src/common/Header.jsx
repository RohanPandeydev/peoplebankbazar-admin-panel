import React, { useState } from 'react'
import { Link } from "react-router-dom";
import {
  Col,
  Container,
  Row,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  Button,
} from "reactstrap";
import { FaRegUser } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { CiLogout } from "react-icons/ci";
import Swal from "sweetalert2";
import { RxHamburgerMenu } from 'react-icons/rx';
import ImagesPath from '../assets/images/ImagePath';
import StorageData from '../helper/storagehelper/StorageData';
import { useMutation } from '@tanstack/react-query';
import AuthServices from '../services/AuthServices';
import useCustomContext from '../contexts/Context';
import Loader from '../utils/Loader/Loader';
import { CgProfile } from "react-icons/cg";

const Header = ({ handleToggleMenu }) => {

  const [loader, setLoader] = useState(false);
  const { userData } = useCustomContext()


  const handleLogout = () => {
    mutation.mutate({
      email: userData?.email
    })


    return;
  };



  const mutation = useMutation(
    (formdata) => AuthServices.logout(formdata),

    {
      onSuccess: (data) => {
        if (!data?.data?.status) {
          Swal.fire({
            title: "Error",
            text: data?.data?.message,
            icon: "error",
          });
          return
        }
        StorageData.removeData()


        setLoader(true);
        Swal.fire({
          title: "Successful",
          text: "User Logged Out Successfully",
          icon: "success",
        });
        window.location.replace("/login");
        return;
      },
      onError: (err) => {
        setLoader(false);
        Swal.fire({
          title: "Error",
          text: err?.response?.data?.message || err?.message,
          icon: "error",
        });
        return;
      },
    }
  );




  return (
    <>
      <header className="header-wrapper">

        {
          loader || mutation?.isLoading ? <Loader /> : <Container fluid>
            <Row>
              <Col xs="12">
                <div className="navbar justify-content-between">
                  <div className="logo-hamburger-menu">
                    <div className="logo-wrap">
                      <Link to="/">
                        <img className="img-fluid"  src={ImagesPath.logo} alt="" />
                      </Link>
                    </div>
                    <div className="hamburger-menu">
                      <Button className="hamburger-tigger" onClick={handleToggleMenu}><RxHamburgerMenu /></Button>
                    </div>
                  </div>
                  <div className="header-right-wrap">
                    <ul>

                      <li>
                        <UncontrolledDropdown setActiveFromChild className="user-dropdown">
                          <DropdownToggle caret className="nav-link" tag="a">
                            <div className="user-info-wrap">
                              {/* <div className="user-info">
                            <h4>{userData?.username || ""}</h4>
                                <p>Available</p>
                            </div> */}
                              {/* <div className="avatar">
                                <img className="img-fluid" src={ImagesPath.logo} alt="" />
                              </div> */}
                              <CgProfile fontSize={30}/>
                            </div>
                          </DropdownToggle>
                          <DropdownMenu>
                            <ul>
                             
                              <li>
                                {/* <DropdownItem href="#" tag="a"> <FaRegUser /> Profile</DropdownItem> */}
                                {/* <Link className='dropdown-item' to={"/profile"}><FaRegUser />Profile</Link> */}
                              </li>
                            

                              <li className="border-top" onClick={handleLogout}>
                                <DropdownItem ><CiLogout /> Logout</DropdownItem>
                              </li>
                            </ul>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </li>
                    </ul>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        }

      </header>
    </>
  )
}

export default Header
