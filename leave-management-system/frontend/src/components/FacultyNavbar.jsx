import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";

// Removed My Leaves and Reports
const navItems = [
  { label: "Dashboard", id: "dashboard", icon: LayoutDashboard },
  { label: "Profile", id: "profile", icon: User },
];

export default function FacultyNavbar({ activeTab, setActiveTab }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const profileRef = useRef(null);
  const mobileRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns if clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileRef.current && !profileRef.current.contains(e.target) &&
        mobileRef.current && !mobileRef.current.contains(e.target)
      ) {
        setUserOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleNavigation = (id) => {
    if (id === "profile") {
      navigate("/profile");
    } else {
      if (window.location.pathname === "/profile") {
        navigate("/dashboard/faculty");
      } else if (setActiveTab) {
        setActiveTab(id);
      }
    }
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-teal-600 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => handleNavigation("dashboard")}
          >
            <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              LeaveMS
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition
                  ${activeTab === item.id || (window.location.pathname === '/profile' && item.id === 'profile') 
                    ? "bg-teal-500 text-white" 
                    : "text-white hover:bg-teal-500"}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}

            {/* Logout */}
            <button
              onClick={logout}
              className="ml-3 p-2 rounded-lg text-white hover:bg-red-500 transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* User Dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setUserOpen(!userOpen)}
                className="ml-2 w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-xs font-bold text-white"
              >
                {user?.name?.charAt(0) || "U"}
              </button>

              <AnimatePresence>
                {userOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-3 w-56 bg-white text-gray-800 rounded-xl shadow-xl"
                  >
                    <div className="px-4 py-3 border-b">
                      <p className="font-semibold">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            ref={mobileRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-teal-500 bg-teal-600"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition w-full text-left
                    ${activeTab === item.id || (window.location.pathname === '/profile' && item.id === 'profile')
                      ? "bg-teal-500 text-white" 
                      : "text-white hover:bg-teal-500"}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}

              {/* Logout */}
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-white transition hover:bg-red-500 w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}