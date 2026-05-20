import { createBrowserRouter } from "react-router";
import PhoneFrame from "./components/PhoneFrame";
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
import GamePage from "./components/GamePage";

export const router = createBrowserRouter([
  {
    Component: PhoneFrame,
    children: [
      { path: "/", Component: Home },
      { path: "/cafe", Component: CafePage },
      { path: "/public", Component: PublicPage },
      { path: "/ktx", Component: KTXPage },
      { path: "/bus", Component: BusPage },
      { path: "/lotteria", Component: LotteriaPage },
      { path: "/table-order", Component: TableOrderPage },
      { path: "/hospital", Component: HospitalPage },
      { path: "/empty", Component: EmptyPage },
      { path: "/game", Component: GamePage },
    ],
  },
  {
    path: "/bank",
    Component: BankPage,
  },
]);
