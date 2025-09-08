import React from "react";
import { createContext, useContext, useState } from "react";
import StorageData from "../helper/storagehelper/StorageData";

const userContext = createContext();
const ContextWrapper = ({ children }) => {
  const myuserToken = StorageData.getToken();
  const myuserData = StorageData.getUserData();
  const myuserPermission = StorageData.getUserPermission();
  const [token, setToken] = useState(myuserToken ? myuserToken : "");
  const [userData, setUserData] = useState(
    myuserData != null ? myuserData : {}
  );
  const [userPermission, setUserPermissions] = useState(
    myuserPermission != null ? myuserPermission : []
  );
  const adminId = userData.role == 1 ? userData?.id : false

  return (
    <userContext.Provider
      value={{
        token,
        setToken,
        userData,
        setUserData,
        adminId,
        userPermission,
        setUserPermissions

      }}
    >
      {children}
    </userContext.Provider>
  );
};


const useCustomContext = () => {
  return useContext(userContext);
};
export default useCustomContext;
export { ContextWrapper };
