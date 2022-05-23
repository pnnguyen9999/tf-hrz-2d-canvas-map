import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers, getUserByid } from "redux/slices/user";
import { Button, Table, Drawer, DrawerProps } from "antd";

type Props = {};

export default function EditUser({}: Props) {
  const dispatch = useDispatch();
  const dataUsers = useSelector((state) => state.user.dataUsers);
  const dataUserById = useSelector((state) => state.user.dataUserById);

  const [isOpenDrawer, setOpenDrawer] = useState(false);
  const [placement, setPlacement] = useState<DrawerProps["placement"]>("right");

  useEffect(() => {
    dispatch(getAllUsers());
  }, []);

  // id(pin):"6289d85842d884ef2a5d429b"
  // email(pin):"admin@gmail.com"
  // username(pin):"admin"
  // role(pin):"SUPER ADMIN"
  // isActive
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

  const handleEditUser = (id: string) => {
    dispatch(getUserByid(id));
    setOpenDrawer(true);
  };

  return (
    <div className="edit-user">
      <Table columns={columns} dataSource={dataUsers} pagination={false} />
      <Drawer
        title="Drawer with extra actions"
        placement={placement}
        width={500}
        onClose={() => setOpenDrawer(false)}
        visible={isOpenDrawer}
      >
        <p>{dataUserById?.id}</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </div>
  );
}
