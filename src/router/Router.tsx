import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainPage from "../pages/MainPage";
import Splash from "../pages/Splash";
import OpenWine from "../pages/OpenWine";
import CloseWine from "../pages/CloseWine";
import ConfirmSeal from "../pages/ConfirmSeal";

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
    path: "/main/confirmseal/close",
    element: <CloseWine />,
  },
  {
    path: "/main/confirmseal",
    element: <ConfirmSeal />,
  },
]);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
