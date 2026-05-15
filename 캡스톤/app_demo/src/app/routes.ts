import { createBrowserRouter } from "react-router";
import Home from "./components/Home";
import CafePage from "./components/CafePage";
import BankPage from "./components/BankPage";
import PublicPage from "./components/PublicPage";
import KTXPage from "./components/KTXPage";
import BusPage from "./components/BusPage";
import LotteriaPage from "./components/LotteriaPage";
import TableOrderPage from "./components/TableOrderPage";
import EmptyPage from "./components/EmptyPage";
import HospitalPage from "./components/HospitalPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/cafe",
    Component: CafePage,
  },
  {
    path: "/bank",
    Component: BankPage,
  },
  {
    path: "/public",
    Component: PublicPage,
  },
  {
    path: "/ktx",
    Component: KTXPage,
  },
  {
    path: "/bus",
    Component: BusPage,
  },
  {
    path: "/lotteria",
    Component: LotteriaPage,
  },
  {
    path: "/table-order",
    Component: TableOrderPage,
  },
  {
    path: "/hospital",
    Component: HospitalPage,
  },
  {
    path: "/empty",
    Component: EmptyPage,
  },
]);
