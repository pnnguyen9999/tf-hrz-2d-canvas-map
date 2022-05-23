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
} from "antd";
import { API_ENDPOINT } from "constant/api";
import axiosService from "services/axiosService";

type Props = {};

export default function EditUser({}: Props) {
  const dispatch = useDispatch();
  const dataUsers = useSelector((state) => state.user.dataUsers);
  const [dataUserById, setDataUserById] = useState<any>();

  //   const dataUserById = useSelector((state) => state.user.dataUserById);

  const [isOpenDrawer, setOpenDrawer] = useState(false);
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
          <div>
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
      });
  };

  const { Option } = Select;
  return (
    <div className="edit-user">
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
              <Option value="Super admin">Super admin</Option>
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
    </div>
  );
}
