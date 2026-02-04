import { useState, useRef, useEffect } from "react";
import { UilUserCircle, UilSignOutAlt } from "@iconscout/react-unicons";
import { useNavigate } from "react-router-dom";

export default function FacultyNavbar() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-teal-600 text-white shadow">
      <div className="max-w-7xl mx-auto h-20 px-6 flex justify-between items-center">
        <h2 className="text-2xl font-extrabold">LeaveMS</h2>

        <div ref={ref} className="relative">
          <button onClick={() => setOpen(!open)}>
            <UilUserCircle size="36" />
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-56 bg-white text-gray-800 rounded-xl shadow-xl">
              <div className="px-4 py-3 border-b">
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-3 w-full hover:bg-red-50 text-red-600 font-semibold"
              >
                <UilSignOutAlt size="18" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
