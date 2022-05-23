import React, { ReactElement, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { API_ENDPOINT } from "constant/api";
import axiosService from "services/axiosService";
import Login from "./Login";
import { Space } from "antd";

export default function Layout(props): ReactElement {
  const [userCheckOkay, setCheckOkay] = useState(true);

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
        // console.log(e);
        // window.location.assign("/login");
      }
    }
    a();
  }, [userCheckOkay]);
  return (
    <div>
      {userCheckOkay ? (
        <div className="col-12">
          <div className="row">
            <div className="col-2 vertical-nav">
              <div className="p-2 d-flex flex-column align-items-center justify-content-center">
                <img
                  src="/img/logo-hrz.png"
                  className="logo-hrz"
                  alt="logo-hrz"
                />
              </div>
              <div className="">
                <Space size={10} direction="vertical">
                  <div className="menu-item">
                    <a href="/edit-map">Map</a>
                  </div>
                  <div className="menu-item">
                    <a href="/edit-user">User Admin</a>
                  </div>
                </Space>
              </div>
            </div>
            <div className="col-10">
              <div className="horizon-nav p-3">Horizon map admin</div>
              <div>{props.children}</div>
            </div>
          </div>
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
}
