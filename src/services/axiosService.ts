import axios from "axios";

import Cookies from "js-cookie";

export const getToken = () => {
  return Cookies.get("token") || null;
};
export const setUserCookie = (token: any) => {
  Cookies.set("token", token, { expires: 7 });
};

class axiosService {
  getCookiesHeader() {
    const token = getToken();
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }
  getExportExcel(url: string, params: any) {
    this.getCookiesHeader();
    return axios({
      url: url, //your url
      method: "GET",
      responseType: "blob",
      params, // important
    });
  }
  get(url: string, params: any) {
    this.getCookiesHeader();
    return axios.get(url, params);
  }
  getImage(url: string, body: any) {
    this.getCookiesHeader();
    return axios.get(url, body);
  }

  post(url: string, body: any) {
    this.getCookiesHeader();
    return axios.post(url, body);
  }
  put(url: string, body: any) {
    this.getCookiesHeader();
    return axios.put(url, body);
  }
  delete(url: string, body: any) {
    this.getCookiesHeader();
    return axios.delete(url, body);
  }
}
export default new axiosService();
