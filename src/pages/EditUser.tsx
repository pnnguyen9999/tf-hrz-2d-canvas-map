import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers, getUserByid } from "redux/slices/user";
import {
  Button,
  Table,
  Drawer,
  DrawerProps,
  Checkbox,
  Space,
  Input,
  Select,
  Modal,
  Form,
} from "antd";
import { API_ENDPOINT } from "constant/api";
import axiosService from "services/axiosService";
import { toast } from "react-toastify";
import { COLOR_BY_TYPE } from "./EditMap";

type Props = {};

export default function EditUser({}: Props) {
  const [createUserForm] = Form.useForm();
  const dispatch = useDispatch();
  const dataUsers = useSelector((state) => state.user.dataUsers);
  const [dataUserById, setDataUserById] = useState<any>();

  //   const dataUserById = useSelector((state) => state.user.dataUserById);

  const [isOpenDrawer, setOpenDrawer] = useState<boolean>(false);
  const [isOpenRegisterModal, setOpenRegisterModal] = useState<boolean>(false);
  const [placement, setPlacement] = useState<DrawerProps["placement"]>("right");

  // gởi cái này để update data user
  const [newPermissions, setNewPermissions] = useState<any>();
  const [newRole, setNewRole] = useState<string>();
  const [isActiveAccount, setIsActiveAccount] = useState<boolean>();
  const [canMerge, setCanMerge] = useState<boolean>();

  useEffect(() => {
    dispatch(getAllUsers());
  }, []);

  const columns = [
    {
      title: "Name",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (isActive: boolean) => {
        return <div>{isActive ? "true" : "false"}</div>;
      },
    },
    {
      title: "Edit",
      dataIndex: "id",
      key: "id",
      render: (id: string) => {
        return <Button onClick={() => handleEditUser(id)}>edit</Button>;
      },
    },
  ];

  const columnsPermissions = [
    {
      title: "Id",
      dataIndex: "_id",
      key: "_id",
    },
    {
      title: "Constraint",
      dataIndex: "constraint",
      render: (constraint: any) => {
        return (
          <div
            className="text-center"
            style={{
              backgroundColor: COLOR_BY_TYPE[constraint.type._id].color,
              padding: "5px",
              borderRadius: "5px",
            }}
          >
            {constraint.area.name}, {constraint.type.name}
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: boolean, record: any) => {
        return (
          <Checkbox
            onChange={() => handleCheckBox(record._id)}
            checked={record.status}
          ></Checkbox>
        );
      },
    },
    {
      title: "Area",
      dataIndex: "constraint",
      render: (constraint: any) => {
        return (
          <div>
            [{constraint.area.initialX}, {constraint.area.initialY}] - [
            {constraint.area.endX}, {constraint.area.endY}]
          </div>
        );
      },
    },
  ];

  const handleEditUser = async (id: string) => {
    // dispatch(getUserByid(id));
    await axiosService.get(`${API_ENDPOINT}/users/${id}`, {}).then((res) => {
      let clonePermissions = [...res.data.data.permissions];
      console.log(res.data.data);
      setDataUserById(res.data.data);
      // init data
      setNewPermissions(clonePermissions);

      setIsActiveAccount(res.data.data.isActive);
      setNewRole(res.data.data.role);
      setCanMerge(res.data.data.canMerge);
    });
    setOpenDrawer(true);
  };

  const handleCheckBox = (id: string) => {
    const index = newPermissions.findIndex((x: any) => x._id === id);
    let changePms = [...newPermissions];
    changePms[index] = {
      ...changePms[index],
      status: !changePms[index].status,
    };
    setNewPermissions(changePms);
  };

  const handleChangeRole = (value: string) => {
    setNewRole(value);
  };

  const handleSave = async (id: string) => {
    const obj = {
      role: newRole,
      isActive: isActiveAccount,
      canMerge: canMerge,
      permissions: newPermissions,
    };
    console.log(obj);
    await axiosService
      .put(`${API_ENDPOINT}/users/${id}/update`, obj)
      .then((res) => {
        console.log(res);
        toast.info(res.data.message);
        dispatch(getAllUsers());
      });
  };

  const { Option } = Select;

  const onSubmiteRegister = async (values: any) => {
    const obj = {
      username: values.username,
      password: values.password,
      email: values.email,
      role: values.role,
    };
    await axiosService
      .post(`${API_ENDPOINT}/auth/register`, obj)
      .then((res) => {
        console.log(res);
        toast.info(res.data.message);
        dispatch(getAllUsers());
        setOpenRegisterModal(false);
      });
    console.log(values);
    createUserForm.resetFields();
  };
  return (
    <div className="edit-user">
      <div className="mb-3">
        <Button onClick={() => setOpenRegisterModal(true)}>
          Create New User
        </Button>
      </div>
      <Table columns={columns} dataSource={dataUsers} pagination={false} />
      <Drawer
        title={`Edit user id ${dataUserById?.id}`}
        placement={placement}
        // width={500}
        onClose={() => setOpenDrawer(false)}
        visible={isOpenDrawer}
        size="large"
      >
        <div className="mb-4">
          <div className="mb-3">
            <Button onClick={() => handleSave(dataUserById?.id)}>Save</Button>
          </div>
          <Space size={10} wrap>
            <Input placeholder="Name" value={dataUserById?.username} />
            <Input placeholder="Email" value={dataUserById?.email} />
            <Select
              value={newRole}
              style={{ width: 120 }}
              onChange={(e) => handleChangeRole(e)}
            >
              <Option value="Administrator">Administrator</Option>
              <Option value="Painter">Painter</Option>
            </Select>
            <Checkbox
              onChange={(e) => setIsActiveAccount(e.target.checked)}
              checked={isActiveAccount}
            >
              is Active
            </Checkbox>
            <Checkbox
              onChange={(e) => setCanMerge(e.target.checked)}
              checked={canMerge}
            >
              can Merge
            </Checkbox>
          </Space>
        </div>
        <Table
          columns={columnsPermissions}
          dataSource={newPermissions}
          pagination={false}
        />
      </Drawer>
      <Modal
        title="Create new user"
        visible={isOpenRegisterModal}
        onOk={() => setOpenRegisterModal(false)}
        onCancel={() => {
          setOpenRegisterModal(false);
        }}
        footer={false}
      >
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          onFinish={onSubmiteRegister}
          autoComplete="off"
          form={createUserForm}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input username!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input password!" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please input email!" },
              {
                type: "email",
                message: "The input is not valid E-mail!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Please select category!" }]}
          >
            <Select className="mr-2" placeholder="select category">
              <Option value="Administrator" key="Administrator">
                Administrator
              </Option>
              <Option value="Painter" key="Painter">
                Painter
              </Option>
            </Select>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Create new user
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
