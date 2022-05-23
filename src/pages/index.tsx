import React, { ReactElement, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getInfoUser } from "redux/slices/user";

import { API_ENDPOINT } from "constant/api";
import axiosService from "services/axiosService";
import Login from "./Login";

export default function Layout(props): ReactElement {
  const [userCheckOkay, setCheckOkay] = useState(false);

  useEffect(() => {
    async function a() {
      try {
        await axiosService.get(`${API_ENDPOINT}/users`, {}).then((res) => {
          console.log(res.status);
          if (res.status === 200) {
            setCheckOkay(true);
          }
        });
      } catch (e) {
        setCheckOkay(false);
        console.log(e);
        // window.location.assign("/login");
      }
    }
    a();
  }, [userCheckOkay]);
  return <div>{userCheckOkay ? props.children : <Login />}</div>;
}
