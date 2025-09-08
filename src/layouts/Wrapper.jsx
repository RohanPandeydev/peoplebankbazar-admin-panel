import { useState } from "react";
import Header from "../common/Header";
import LeftSidebar from "../common/LeftSidebar";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const Wrapper = ({ children }) => {
  const [toggleMenu, setToggleMenu] = useState(false);
  const nav = useNavigate()


  const handleBack = () => {
    nav(-1)
  }


  const handleToggleMenu = () => {
    setToggleMenu(!toggleMenu);
  };
  return (
    <>
      <Header handleToggleMenu={handleToggleMenu} />
      <main className="main-body">
        {/* <Button type="click" className="text-align-left" onClick={handleBack}>Back</Button> */}
        <div className="main-row">
          <LeftSidebar toggleMenu={toggleMenu} />
          <div className="body-content">{children}</div>
        </div>
      </main>
    </>
  );
};

export default Wrapper;
