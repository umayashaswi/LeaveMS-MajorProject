import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UilEstate,
  UilChart,
  UilLock,
  UilFileAlt,
  UilUserCircle,
  UilSignOutAlt,
} from "@iconscout/react-unicons";

export default function AdminNavbar() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {};

  /* ---------- logout ---------- */
  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  /* ---------- close dropdown on outside click ---------- */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="fixed top-0 z-50 w-full bg-teal-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* LOGO */}
        <h2 className="text-2xl font-extrabold tracking-tight">
          LeaveMS
        </h2>

        {/* ICON ACTIONS */}
        <div className="flex items-center gap-6">

          {/* Dashboard */}
          <IconBtn icon={<UilEstate />} tooltip="Dashboard" />

          {/* Analytics */}
          <IconBtn icon={<UilChart />} tooltip="Analytics" />

          {/* Locks */}
          <IconBtn icon={<UilLock />} tooltip="Global Locks" />

          {/* All Requests */}
          <IconBtn icon={<UilFileAlt />} tooltip="All Leave Requests" />

          {/* PROFILE */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="hover:text-teal-200 transition"
            >
              <UilUserCircle size="38" />
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-56 bg-white text-gray-800 rounded-xl shadow-xl overflow-hidden">

                {/* USER INFO */}
                <div className="px-4 py-3 border-b">
                  <p className="font-semibold">{user.name || "Admin"}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>

                {/* ACTIONS */}
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition"
                >
                  <UilSignOutAlt />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ---------- ICON BUTTON ---------- */
function IconBtn({ icon, tooltip }) {
  return (
    <div className="group relative">
      <button className="hover:text-teal-200 transition">
        {icon}
      </button>
      <span className="absolute top-10 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
        {tooltip}
      </span>
    </div>
  );
}
