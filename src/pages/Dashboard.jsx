import Wrapper from "../layouts/Wrapper";
import { MdArrowBackIos } from "react-icons/md";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const nav = useNavigate()
  const handleBack = () => {
    nav(-1)
  }

  return (
    <Wrapper>
      <div className="admin-heading-header">
        <Button className="back-button" type="click" onClick={handleBack}>
          <MdArrowBackIos />Back</Button>
        <h1>Dashboard</h1>
      </div>
    </Wrapper>
  );
};

export default Dashboard;
