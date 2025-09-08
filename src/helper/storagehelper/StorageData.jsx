import secureLocalStorage from "react-secure-storage";
import config from "../../../config";

class StorageData {
  setToken(data) {
    secureLocalStorage.setItem(config.localStorageUserToken, data);
  }

  setData(data) {
    secureLocalStorage.setItem(
      config?.localStorageUserDetails,
      JSON.stringify(data)
    );
  }
  setUserPermission(data) {
    secureLocalStorage.setItem(
      config?.localStorageUserPermission,
      JSON.stringify(data)
    );
  }
  getToken() {
    return secureLocalStorage.getItem(config.localStorageUserToken);
  }


  getUserData() {
    return JSON.parse(
      secureLocalStorage.getItem(config?.localStorageUserDetails)
    );
  }
  getUserPermission() {
    return JSON.parse(
      secureLocalStorage.getItem(config?.localStorageUserPermission)
    );
  }
  removeData() {
    secureLocalStorage.removeItem(config?.localStorageUserDetails);
    secureLocalStorage.removeItem(config.localStorageUserToken);
    secureLocalStorage.removeItem(config.localStorageUserPermission);
    return;
  }
}

export default StorageData = new StorageData();
