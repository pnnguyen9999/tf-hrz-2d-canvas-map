import React from "react";
import { Form, Input, Button, message } from "antd";
import axios from "axios";
import { API_ENDPOINT } from "constant/api";
import { setUserCookie } from "services/axiosService";
type Props = {};

export default function Login({}: Props) {
  const login = (email: string, password: string) => {
    const data = {
      email,
      password,
    };
    return axios.post(`${API_ENDPOINT}/auth/login`, data);
  };

  const onFinish = async (values: any) => {
    try {
      await login(values.email, values.password).then((res) => {
        console.log(res.data);
        setUserCookie(res.data.data);
        window.location.assign("/edit-map");
      });
      console.log("Success:", values);
    } catch (e) {
      console.log(e);
      message.error("Wrong login info");
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    // console.log("Failed:", errorInfo);
  };

  return (
    <div className="page-login d-flex align-items-center justify-content-center">
      <div className="col-12 px-5">
        <div className="row">
          <div className="col-4">
            <div className="left-panel">
              <div>
                <img src="/img/logo-hrz.png" className="logo-login" />
              </div>
            </div>
          </div>
          <div className="col-8">
            <div className="right-panel">
              <div className="d-flex flex-column align-items-center justify-content-center">
                <Form
                  name="basic"
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                  initialValues={{ remember: true }}
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
                  autoComplete="off"
                >
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      {
                        required: true,
                        message: "Please input your username!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Please input your password!",
                      },
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>
                  <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit">
                      Login
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
