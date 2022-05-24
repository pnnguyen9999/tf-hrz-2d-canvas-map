import React, { ReactElement, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import { API_ENDPOINT } from "constant/api";
import axiosService from "services/axiosService";
import Login from "./Login";
import { Button, Space } from "antd";
import Cookies from "js-cookie";

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

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" });
    window.location.reload();
  };
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
              <div className="w-100">
                <Space size={10} direction="vertical" className="w-100">
                  <NavLink
                    to="/edit-map"
                    className={({ isActive }) =>
                      isActive ? "menu-item active" : "menu-item"
                    }
                  >
                    Edit Map
                  </NavLink>
                  <NavLink
                    to="/edit-user"
                    className={({ isActive }) =>
                      isActive ? "menu-item active" : "menu-item"
                    }
                  >
                    User Admin
                  </NavLink>
                </Space>
              </div>
            </div>
            <div className="col-10">
              <div className="horizon-nav p-3 d-flex justify-content-end">
                <Button onClick={() => handleLogout()} danger type="primary">
                  Logout
                </Button>
              </div>
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
