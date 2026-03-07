import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X,
  CalendarDays,
  Bell,
  ArrowRight,
  Megaphone
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Removed Requests and Analytics
const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/hod" },
  { label: "Profile", icon: User, href: "/dashboard/hod/profile" },
];

export default function HodNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  
  const notifRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchNotices();

    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/messages/hod/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch notices", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-teal-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO */}
          <Link to="/dashboard/hod" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center shadow-sm">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-tight text-white">
              <span className="text-lg font-bold tracking-tight">LeaveMS</span>
              <span className="text-[10px] font-semibold text-teal-100 uppercase tracking-widest">HOD Panel</span>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const active = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                      active ? "bg-teal-700 text-white" : "text-white hover:bg-teal-500"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* NOTIFICATION BELL */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className={`p-2 rounded-full transition relative ${notifOpen ? 'bg-teal-700' : 'text-white hover:bg-teal-500'}`}
              >
                <Bell className="w-5 h-5" />
                {messages.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-teal-600"></span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden text-gray-900"
                  >
                    <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
                      <h3 className="font-bold text-sm flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-teal-600" /> Announcements
                      </h3>
                      <Badge className="bg-teal-100 text-teal-700 border-none hover:bg-teal-100">{messages.length}</Badge>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {messages.length === 0 ? (
                        <div className="p-10 text-center text-gray-400 text-xs italic">No new announcements</div>
                      ) : (
                        messages.slice(0, 5).map((m) => (
                          <div key={m._id} className="p-4 border-b hover:bg-slate-50 transition cursor-default">
                            <div className="flex items-center gap-2 mb-1">
                              {m.pinned && <span className="w-2 h-2 bg-amber-500 rounded-full" />}
                              <p className="font-bold text-xs line-clamp-1">{m.title}</p>
                            </div>
                            <p className="text-[11px] text-gray-500 line-clamp-2">{m.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <Link 
                      to="/dashboard/hod/notices" 
                      onClick={() => setNotifOpen(false)}
                      className="block p-3 text-center text-xs font-bold text-teal-600 bg-slate-50 hover:bg-slate-100 transition border-t"
                    >
                      View All Notices <ArrowRight className="inline w-3 h-3 ml-1" />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-[1px] bg-teal-500/50 mx-1" />

            <button onClick={handleLogout} className="p-2 rounded-lg text-white hover:bg-red-500 transition" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* MOBILE TOGGLE */}
          <div className="md:hidden flex items-center gap-2">
             <button
               className="p-2 rounded-full text-white hover:bg-teal-500 relative"
               onClick={() => navigate("/dashboard/hod/notices")}
             >
                <Bell className="w-5 h-5" />
                {messages.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-teal-600" />}
             </button>
             <button className="p-2 rounded-lg text-white" onClick={() => setMobileOpen(!mobileOpen)}>
               {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
          </div>

        </div>
      </div>
      
      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-teal-700 border-t border-teal-500 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 text-white font-medium p-2 rounded-lg hover:bg-teal-600"
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-teal-600">
                <div className="flex items-center gap-3 px-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white uppercase">
                    {user?.name?.charAt(0)}
                  </div>
                  <div className="text-white">
                    <p className="text-sm font-bold">{user?.name}</p>
                    <p className="text-xs text-teal-200">{user?.email}</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full text-left text-red-200 font-medium p-2 rounded-lg hover:bg-red-500 hover:text-white transition"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}