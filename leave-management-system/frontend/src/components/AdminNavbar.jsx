import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  LogOut,
  Menu,
  X,
  FileText,
  MessageSquare,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Messages", icon: MessageSquare, href: "/admin/messages" },
  { label: "All Requests", icon: FileText, href: "/admin/all-requests" },
];

export default function AdminNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  
  const profileRef = useRef(null);
  const mobileRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  /* ---------- Logout ---------- */
  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  /* ---------- Close dropdown on outside click ---------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileRef.current && !profileRef.current.contains(e.target) &&
        (!mobileRef.current || !mobileRef.current.contains(e.target))
      ) {
        setUserOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-teal-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO SECTION */}
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight leading-tight">
                LeaveMS
              </span>
              <span className="text-[10px] font-bold text-teal-100 uppercase tracking-widest">
                Admin Panel
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    active 
                      ? "bg-teal-500 text-white" 
                      : "text-white hover:bg-teal-500"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            {/* Logout Button */}
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
                className="ml-2 w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-xs font-bold text-white border border-teal-400 hover:bg-teal-400 transition"
              >
                {user?.name?.charAt(0) || "A"}
              </button>

              <AnimatePresence>
                {userOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-3 w-56 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b bg-gray-50">
                      <p className="font-bold text-sm text-gray-900">{user?.name || "Administrator"}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <div className="p-1">
                       <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* MOBILE TOGGLE */}
          <button
            className="md:hidden p-2 rounded-lg text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            ref={mobileRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-teal-500 bg-teal-600"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const active = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
                      active
                        ? "bg-teal-500 text-white"
                        : "text-white hover:bg-teal-500"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white hover:bg-red-500 transition"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}