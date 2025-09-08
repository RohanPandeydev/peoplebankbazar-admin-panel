import StorageData from "../storagehelper/StorageData";

class HttpHelper {


    getAuthHeader() {
        return {
            headers: {
                "Authorization":StorageData.getToken(),
            }
        }
    }

    getAuthHeaderMultiPart() {
        return {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization":"Bearer "+StorageData.getToken(),
            }
        }
    }
}

export default HttpHelper = new HttpHelper();