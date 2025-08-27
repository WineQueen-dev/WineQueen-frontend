import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainPage from "../pages/MainPage";
import Splash from "../pages/Splash";
import OpenWine from "../pages/OpenWine";
import CloseWine from "../pages/CloseWine";

const router = createBrowserRouter([
  {
    path: "/main",
    element: <MainPage />,
  },
  {
    path: "/",
    element: <Splash />,
  },
  {
    path: "/main/open",
    element: <OpenWine />,
  },
  {
    path: "/main/close",
    element: <CloseWine />,
  },
]);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
