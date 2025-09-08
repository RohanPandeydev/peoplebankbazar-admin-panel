import React, { useState } from "react";
import {
  Col,
  Container,
  Input,
  InputGroup,
  InputGroupText,
  Button,
  Row,
} from "reactstrap";
import { LuUser } from "react-icons/lu";
import { BiKey } from "react-icons/bi";
import { useFormik } from "formik";
import { LoginFormValidation } from "../helper/ValidationHelper/Validation";
import { useLocation } from "react-router-dom";
import ImagesPath from "../assets/images/ImagePath";
import Swal from 'sweetalert2'
import { useMutation } from "@tanstack/react-query";
import StorageData from "../helper/storagehelper/StorageData";
import AuthServices from "../services/AuthServices";
import Loader from "../utils/Loader/Loader";

const Login = () => {
  const location = useLocation();
  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: LoginFormValidation,
    onSubmit: (values, action) => {
      submitHandler(values);
    },
  });
  const [loader, setLoader] = useState(false);

  const submitHandler = (data) => {
    mutation.mutate(data);
  };


  const mutation = useMutation(
    (formdata) => AuthServices.login(formdata),

    {
      onSuccess: (data) => {


        StorageData.setToken(data?.data?.token);
        StorageData.setData(data?.data?.admin);
        setLoader(true);
        Swal.fire({
          title: "Successful",
          text: "User Logged In Successfully",
          icon: "success",
        });
        window.location.replace(location?.state?.path || "/");
        return;
      },
      onError: (err) => {
        setLoader(false);
        Swal.fire({
          title: "Error",
          text: err?.response?.data || err?.message,
          icon: "error",
        });
        return;
      },
    }
  );






  return (
    <>
      <section className="login-wrapper">

        <Container fluid>
          {
            loader || mutation.isLoading ? <Loader /> : <Row>
              <Col md="6" className="p-0">
                <div className="login-left-wrap">
                  <div className="login-logo">
                    <img className="img-fluid" src={ImagesPath.logo} alt="" />
                  </div>
                  <div className="login-couple-img">
                    <img className="img-fluid" src={ImagesPath.logocouple} alt="" />
                  </div>
                </div>
              </Col>
              <Col md="6" className="p-0">
                <div className="login-from-wrap">
                  <div className="login-form">
                    <h3>Sign in</h3>
                    <form onSubmit={formik.handleSubmit}>
                      <InputGroup className="mb-3">
                        <InputGroupText>
                          <LuUser />
                        </InputGroupText>
                        <Input
                          placeholder="Email"
                          name="email"
                          value={formik.values.email}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          autoComplete="new-email"
                          className={
                            formik.touched.email && formik.errors.email
                              ? "is-invalid"
                              : ""
                          }
                        />
                      </InputGroup>
                      {formik.touched.email && (
                        <p className="text-danger">{formik.errors.email}</p>
                      )}
                      <InputGroup className="mb-5">
                        <InputGroupText>
                          <BiKey />
                        </InputGroupText>
                        <Input
                          type="password"
                          placeholder="Password"
                          name="password"
                          value={formik.values.password}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          autoComplete="new-password"
                          className={
                            formik.touched.password && formik.errors.password
                              ? "is-invalid"
                              : ""
                          }
                        />
                      </InputGroup>
                      {formik.touched.password && (
                        <p className="text-danger">{formik.errors.password}</p>
                      )}
                      <div className="submit-login mb-3">
                        <Button
                          type="submit"
                          className="btn btn-style1"
                          disabled={
                            formik.values.password && formik.values.email
                              ? false
                              : true
                          }
                        >
                          {" "}
                          Sign in{" "}
                        </Button>
                      </div>
                      {/* <div className="dont-account text-center">
                                      <p>Don't have an account?  <Link to="/">Sign up here</Link></p>
                                  </div> */}
                    </form>
                  </div>
                </div>
              </Col>
            </Row>
          }

        </Container>

      </section>
    </>
  );
};

export default Login;
