import React from "react";
import { Route, Routes } from "react-router-dom";
import PageNotFound from "./pages/PageNotFound";
import RoutesPath from './helper/Routes/Routes'
const App = () => {

  return (
    <>
      <Routes>
        {
          RoutesPath()
        }

        <Route path="/*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export default App;
