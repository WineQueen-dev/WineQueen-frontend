import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainPage from "../pages/MainPage";
import Splash from "../pages/Splash";
import OpenWine from "../pages/OpenWine";
import CloseWine from "../pages/CloseWine";
import ConfirmSeal from "../pages/ConfirmSeal";
import ConfirmOpen from "../pages/ConfirmOpen";

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
    path: "/main/confirmopen/open",
    element: <OpenWine />,
  },
  {
    path: "/main/confirmseal/close",
    element: <CloseWine />,
  },
  {
    path: "/main/confirmseal",
    element: <ConfirmSeal />,
  },
  {
    path: "/main/confirmopen",
    element: <ConfirmOpen />,
  },
]);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
