import { Outlet } from "react-router";
import "./PhoneFrame.css";

export default function PhoneFrame() {
  return (
    <div className="phone-root">
      <div className="phone-frame">
        <Outlet />
      </div>
    </div>
  );
}
