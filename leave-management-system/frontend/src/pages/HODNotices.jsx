import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Clock, Pin, ArrowLeft, Loader2, MessageSquare, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/HodNavbar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const CATEGORY_CONFIG = {
  general: { label: "General", badge: "bg-blue-100 text-blue-700" },
  "leave-lock": { label: "Leave Lock", badge: "bg-amber-100 text-amber-700" },
  fest: { label: "Fest / Event", badge: "bg-purple-100 text-purple-700" },
  exam: { label: "Exam Period", badge: "bg-rose-100 text-rose-700" },
  urgent: { label: "Urgent", badge: "bg-red-100 text-red-700" },
};

export default function HODNotices() {
  const [notices, setNotices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllNotices = async () => {
      const token = localStorage.getItem("token"); // 🔥 Get token fresh inside effect
      
      console.log("Fetching notices with token:", token ? "Exists" : "MISSING");

      try {
        const res = await axios.get("http://localhost:5000/api/messages/hod/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log("Notices received from Backend:", res.data); // 🔥 Debug log
        setNotices(res.data);
      } catch (err) {
        console.error("API Error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAllNotices();
  }, []);

  const filteredNotices = notices.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <button onClick={() => navigate("/dashboard/hod")} className="flex items-center gap-2 text-slate-500 hover:text-teal-600 font-medium transition group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-100">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Notice Board</h1>
                <p className="text-slate-500 font-medium">Official updates and announcements</p>
              </div>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search announcements..." 
                className="pl-9 bg-white border-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="py-20 text-center flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
                <p className="text-slate-500 font-medium animate-pulse">Fetching your notices...</p>
              </div>
            ) : filteredNotices.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl border border-dashed border-slate-300 p-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                   <MessageSquare className="w-10 h-10" />
                </div>
                <p className="text-slate-500 font-bold text-lg">No Announcements Found</p>
                <p className="text-slate-400 text-sm">Check back later for updates from the Admin.</p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {filteredNotices.map((n, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={n._id}
                    className={`bg-white p-6 rounded-2xl border shadow-sm relative group hover:shadow-md transition-shadow ${n.pinned ? 'border-amber-200 bg-amber-50/5' : 'border-slate-200'}`}
                  >
                    {n.pinned && (
                      <div className="absolute top-0 right-8 px-2 py-1 bg-amber-500 rounded-b-lg shadow-sm">
                        <Pin className="w-3 h-3 text-white fill-white" />
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Badge variant="outline" className={`border-none font-bold uppercase text-[10px] px-2 py-1 ${CATEGORY_CONFIG[n.category]?.badge || 'bg-slate-100 text-slate-600'}`}>
                        {CATEGORY_CONFIG[n.category]?.label || n.category}
                      </Badge>
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        {new Date(n.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-teal-700 transition-colors">{n.title}</h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">{n.content}</p>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                       <span className="text-[10px] font-bold text-slate-400 uppercase">From: Administration</span>
                       {n.type === 'direct' && <Badge variant="secondary" className="text-[9px] bg-blue-50 text-blue-600 border-none">Confidential</Badge>}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </>
  );
}