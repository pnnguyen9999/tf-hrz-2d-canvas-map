import React, { ReactElement, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { API_ENDPOINT } from "constant/api";
import axiosService from "services/axiosService";
import Login from "./Login";
import { Button, Form, Input, Modal, Space } from "antd";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setUserProfile } from "redux/slices/user";
import _ from "lodash";

export default function Layout(props): ReactElement {
  const dispatch = useDispatch();
  const [changePasswordForm] = Form.useForm();
  const [userCheckOkay, setCheckOkay] = useState(true);
  const [isOpenChangePasswordModal, setOpenChangePasswordModal] =
    useState<boolean>(false);
  const dataUserProfile = useSelector((state) => state.user.dataUserProfile);
  useEffect(() => {
    async function a() {
      try {
        await axiosService
          .get(`${API_ENDPOINT}/auth/profile`, {})
          .then((res) => {
            dispatch(setUserProfile(res.data.data));
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

  const onSubmitChangePassword = async (values: any) => {
    if (!_.isEqual(values.oldPassword, values.newPassword)) {
      const dataSend = {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      };
      try {
        await axiosService
          .put(`${API_ENDPOINT}/auth/changePassword`, dataSend)
          .then((res: any) => {
            if (res.status === 200) {
              console.log(res.data);
              changePasswordForm.resetFields();
              toast.info(res.data.message);
              setOpenChangePasswordModal(false);
            } else {
              toast.error("Change password failed !");
            }
          });
      } catch (e) {
        toast.error("Change password failed");
      }
    } else {
      toast.error("An old is new, a new is old :)");
    }
  };
  return (
    <div>
      <ToastContainer position="top-center" theme="dark" />
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
              <div className="horizon-nav p-3 d-flex justify-content-end align-items-center">
                <Space size={12}>
                  <div>
                    [{dataUserProfile?.role?.toLowerCase()}]: &nbsp;
                    <b>{dataUserProfile?.email}</b>
                  </div>
                  <Button onClick={() => setOpenChangePasswordModal(true)}>
                    Change Password
                  </Button>
                  <Button onClick={() => handleLogout()} danger type="primary">
                    Logout
                  </Button>
                </Space>
              </div>
              <div>{props.children}</div>
            </div>
          </div>
        </div>
      ) : (
        <Login />
      )}
      <Modal
        title="Change Password"
        visible={isOpenChangePasswordModal}
        onCancel={() => {
          setOpenChangePasswordModal(false);
        }}
        footer={false}
      >
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          onFinish={onSubmitChangePassword}
          autoComplete="off"
          form={changePasswordForm}
        >
          <Form.Item
            label="Old password"
            name="oldPassword"
            rules={[{ required: true, message: "Please input old password!" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="New password"
            name="newPassword"
            rules={[{ required: true, message: "Please input password!" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
