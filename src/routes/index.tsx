import Dashboard from "pages/Dashboard";
import EditMap from "pages/EditMap";
import EditMapO from "pages/EditMapO";
import EditUser from "pages/EditUser";
import Login from "pages/Login";

const routesGlobal = [
  {
    exact: true,
    path: "/edit-map",
    element: <EditMapO />,
  },
  {
    exact: true,
    path: "/edit-user",
    element: <EditUser />,
  },
  {
    exact: true,
    path: "/",
    element: <Dashboard />,
  },
  {
    exact: true,
    path: "/login",
    element: <Login />,
  },
];

export { routesGlobal };
