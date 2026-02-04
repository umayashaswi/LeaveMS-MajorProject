import { useState, useRef, useEffect } from "react";
import { UilUserCircle, UilSignOutAlt } from "@iconscout/react-unicons";
import { useNavigate } from "react-router-dom";

function HodNavbar({
  facultyRef,
  leaveRef,
  acceptedRef,
  pendingRef,
  forwardedRef,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [active, setActive] = useState(user.active ?? true);

  /* ---------- scroll helper ---------- */
  const scrollTo = (ref) => {
    ref?.current?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  /* ---------- close dropdown on outside click ---------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------- toggle status (UI ONLY) ---------- */
  const toggleStatus = () => {
    const updated = { ...user, active: !active };
    setActive(!active);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  /* ---------- logout ---------- */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/"); // landing page
  };

  return (
    <nav className="w-full fixed top-0 z-50 bg-teal-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        {/* LOGO */}
        <h2
          className="text-2xl font-extrabold tracking-tight cursor-pointer"
          onClick={() => navigate("/")}
        >
          LeaveMS
        </h2>

        {/* NAV LINKS */}
        <div className="flex items-center gap-4">
          <button onClick={() => scrollTo(facultyRef)} className="nav-btn">
            Faculty List
          </button>
          <button onClick={() => scrollTo(leaveRef)} className="nav-btn">
            Leave Requests
          </button>
          <button onClick={() => scrollTo(acceptedRef)} className="nav-btn">
            Accepted
          </button>
          <button onClick={() => scrollTo(pendingRef)} className="nav-btn">
            Pending
          </button>
          <button onClick={() => scrollTo(forwardedRef)} className="nav-btn">
            Forwarded
          </button>

          {/* PROFILE ICON */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="ml-2 hover:text-teal-200 transition"
            >
              <UilUserCircle size="38" />
            </button>

            {/* DROPDOWN */}
            {open && (
              <div className="absolute right-0 mt-3 w-56 bg-white text-gray-800 rounded-xl shadow-xl overflow-hidden">
                {/* USER INFO */}
                <div className="px-4 py-3 border-b">
                  <p className="font-semibold">{user.name || "HOD"}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>

                {/* STATUS */}
                <div className="px-4 py-3 space-y-3 border-b">
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <button
                      onClick={toggleStatus}
                      className={`mt-1 w-full px-3 py-2 rounded-lg text-sm font-semibold transition ${
                        active
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      {active ? "Active" : "Inactive"}
                    </button>
                  </div>
                </div>

                {/* LOGOUT */}
                <div className="px-4 py-3">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition"
                  >
                    <UilSignOutAlt size="18" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BUTTON STYLE */}
      <style>
        {`
          .nav-btn {
            padding: 8px 16px;
            border-radius: 9999px;
            background: white;
            color: #0f766e;
            font-weight: 600;
            transition: all 0.2s;
          }
          .nav-btn:hover {
            background: #ccfbf1;
          }
        `}
      </style>
    </nav>
  );
}

export default HodNavbar;
