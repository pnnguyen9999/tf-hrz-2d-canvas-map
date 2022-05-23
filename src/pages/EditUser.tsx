import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers, getUserByid } from "redux/slices/user";
import { Button, Table, Drawer, DrawerProps, Checkbox } from "antd";
import { API_ENDPOINT } from "constant/api";
import axiosService from "services/axiosService";

type Props = {};

export default function EditUser({}: Props) {
  const dispatch = useDispatch();
  const dataUsers = useSelector((state) => state.user.dataUsers);
  const dataUserById = useSelector((state) => state.user.dataUserById);

  const [isOpenDrawer, setOpenDrawer] = useState(false);
  const [placement, setPlacement] = useState<DrawerProps["placement"]>("right");

  // gởi cái này để update permissions user
  const [newPermissions, setNewPermissions] = useState<any>();
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
      setNewPermissions(clonePermissions);
    });
    setOpenDrawer(true);
  };

  const handleCheckBox = (id: string) => {
    console.log(id);
    console.log(newPermissions);
    console.log(newPermissions.findIndex((x: any) => x._id === id));
    const index = newPermissions.findIndex((x: any) => x._id === id);
    let changePms = [...newPermissions];
    changePms[index] = {
      ...changePms[index],
      status: !changePms[index].status,
    };
    setNewPermissions(changePms);
  };

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
        <p>{dataUserById?.id}</p>
        <Table
          columns={columnsPermissions}
          dataSource={newPermissions}
          pagination={false}
        />
      </Drawer>
    </div>
  );
}
