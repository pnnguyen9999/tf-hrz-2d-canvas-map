import "styles/app.scss";
import "styles/global.scss";
import { Provider } from "react-redux";
import store from "redux/store";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { routesGlobal } from "routes";
// import Home from "pages";
import Layout from "pages";
import "antd/dist/antd.css";

const showLayout = (routes) => {
  if (routes && routes.length > 0) {
    return routes.map((route, index) => {
      return (
        <Route
          key={index}
          path={route.path}
          element={<Layout>{route.element}</Layout>}
        />
      );
    });
  }
};

function App(): JSX.Element {
  return (
    <Provider store={store}>
      <div className="App">
        <BrowserRouter>
          <Routes>{showLayout(routesGlobal)}</Routes>
        </BrowserRouter>
      </div>
    </Provider>
  );
}

export default App;
