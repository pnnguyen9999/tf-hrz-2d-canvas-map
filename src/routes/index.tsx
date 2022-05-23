import EditMap from "pages/EditMap";
import Login from "pages/Login";

const routesGlobal = [
  {
    exact: true,
    path: "/edit-map",
    element: <EditMap />,
  },
  {
    exact: true,
    path: "/login",
    element: <Login />,
  },
];

export { routesGlobal };
