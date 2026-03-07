import { useEffect, useState } from "react";
import LeaveRequestCard from "../components/LeaveRequestCard";
import ActionModal from "../components/ActionModal";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/HodNavbar";
import Footer from "../components/Footer";
import { Megaphone, Pin } from "lucide-react"; 
import { Bar } from "react-chartjs-2";
import { Toaster, toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion"; // 🔥 ADD AnimatePresence
import {
  UilClipboardNotes,
  UilLock
} from "@iconscout/react-unicons";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
  Forward,
  BarChart3,
  Loader2,
} from "lucide-react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function DashboardHOD() {
  
  const token = localStorage.getItem("token");

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState([]);

  const [activeTab, setActiveTab] = useState("PENDING");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingId, setLoadingId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [comment, setComment] = useState("");

  // ✅ LOCK STATES
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const ITEMS_PER_PAGE = 6;

  // ✅ KEEP ONLY THIS VERSION
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchLeaves(), fetchAnalytics(), fetchNotices()]);
      } catch (err) {
        console.error("Data load failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const fetchLeaves = async () => {
    const res = await axios.get("http://localhost:5000/api/leave/hod", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLeaves(res.data);
  };
const [notices, setNotices] = useState([]);

  const fetchNotices = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/messages/hod/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotices(res.data);
    } catch (err) { console.error(err); }
  };
  const fetchAnalytics = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/analytics/hod", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(res.data);
    } catch {
      setAnalytics([]);
    }
  };

  const handleAction = (id, type) => {
    setSelectedLeaveId(id);
    setModalType(type);
    setModalOpen(true);
  };

  const submitAction = async () => {
    try {
      if ((modalType === "REJECTED" || modalType === "FORWARDED") && !comment) {
        toast.error("Comment required");
        return;
      }

      setLoadingId(selectedLeaveId);

      await axios.put(
        `http://localhost:5000/api/leave/${selectedLeaveId}/action`,
        {
          status: modalType,
          hodComment: comment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Leave ${modalType.toLowerCase()} successfully`);
      fetchLeaves();

      setModalOpen(false);
      setComment("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoadingId(null);
    }
  };

  // ✅ FIXED LOCK FUNCTION
  const lockLeaves = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both dates");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error("End date cannot be before start date");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/locked/create",
        {
          startDate,
          endDate,
          reason,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Leave period locked successfully");
      setStartDate("");
      setEndDate("");
      setReason("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to lock period");
    }
  };

  const tabMap = {
    PENDING: leaves.filter(l => l.status === "PENDING"),
    APPROVED: leaves.filter(l => l.status === "APPROVED"),
    FORWARDED: leaves.filter(l => l.status === "FORWARDED"),
    REJECTED: leaves.filter(l => l.status === "REJECTED"),
  };

  const activeLeaves = tabMap[activeTab] || [];
  const totalPages = Math.ceil(activeLeaves.length / ITEMS_PER_PAGE);

  const paginatedLeaves = activeLeaves.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const chartData = {
    labels: analytics.map(a => a.month),
    datasets: [
      {
        label: "Department Leaves",
        data: analytics.map(a => a.count),
        backgroundColor: "#14b8a6",
        borderRadius: 6,
      },
    ],
  };
  // ✅ IF LOADING, SHOW SPINNER INSTEAD OF DASHBOARD
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-teal-600">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Syncing Department Data...</p>
      </div>
    );
  }

  return (
  <>
    <Toaster position="top-right" />
    <Navbar />

    <main className="pt-28 pb-14 px-6 max-w-7xl mx-auto space-y-10">

    {/* 🔥 NEW: NOTICE BOARD SECTION 🔥 */}
        <AnimatePresence>
          {notices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
  <div className="flex items-center justify-between w-full">
    <h2 className="text-lg font-bold text-amber-900 leading-tight">Notice Board</h2>
    <Link to="/dashboard/hod/notices" className="text-xs font-bold text-amber-700 hover:underline">
      View All →
    </Link>
  </div>
  <p className="text-xs text-amber-700 font-medium">Important updates from the Administration</p>
</div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notices.slice(0, 3).map((n) => (
                  <div key={n._id} className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-amber-100 relative group">
                    {n.pinned && <Pin className="absolute top-3 right-3 w-3 h-3 text-amber-500 fill-amber-500" />}
                    <div className="flex items-center gap-2 mb-2">
                       <Badge variant="outline" className="text-[9px] uppercase font-black bg-amber-100 text-amber-700 border-none px-1.5">{n.category}</Badge>
                       <span className="text-[10px] font-bold text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-800 mb-1">{n.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{n.content}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            HOD Dashboard 🎓
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow">
          Leave Year: {new Date().getFullYear()}
        </div>
      </motion.div>

      {/* STATS */}
<div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

  {[
    {
      label: "Total",
      value: leaves.length,
      icon: ClipboardList,
      color: "text-gray-700",
      bg: "bg-gray-100",
    },
    {
      label: "Pending",
      value: tabMap.PENDING.length,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Approved",
      value: tabMap.APPROVED.length,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Rejected",
      value: tabMap.REJECTED.length,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Forwarded",
      value: tabMap.FORWARDED.length,
      icon: Forward,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ].map((stat, i) => {
    const Icon = stat.icon;

    return (
      <motion.div
        key={stat.label}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: i * 0.05 }}
        className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center justify-between"
      >
        <div>
          <p className="text-xs text-gray-500 tracking-wide">
            {stat.label}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stat.value}
          </p>
        </div>

        <div className={`p-3 rounded-lg ${stat.bg}`}>
          <Icon className={`w-5 h-5 ${stat.color}`} />
        </div>
      </motion.div>
    );
  })}

</div>

      {/* LEAVE REQUESTS */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Leave Requests
          </h3>

          <div className="flex gap-2 flex-wrap">
            {Object.keys(tabMap).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-teal-600 text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab
                    ? "bg-white/20"
                    : "bg-white border"
                }`}>
                  {tabMap[tab].length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeLeaves.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No {activeTab.toLowerCase()} requests found
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {paginatedLeaves.map((l) => (
                <LeaveRequestCard
                  key={l._id}
                  leave={l}
                  loadingId={loadingId}
                  handleAction={handleAction}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* ANALYTICS */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Department Leave Analytics ({new Date().getFullYear()})
          </h3>
        </div>

        <div className="p-6">
          {analytics.length ? (
            <Bar data={chartData} />
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>
      </motion.div>

      {/* LOCK LEAVE PERIOD */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 shadow-sm"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Lock Leave Period
          </h3>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-500">
            Prevent faculty from applying leave during exams or important events.
          </p>

          <div className="grid md:grid-cols-4 gap-4 items-end">

            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <Input
                type="text"
                placeholder="Exam schedule, Internal review, etc."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <button
              onClick={lockLeaves}
              className="h-10 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-md shadow hover:opacity-90 transition"
            >
              Lock Period
            </button>

          </div>
        </div>
      </motion.div>

    </main>

    <ActionModal
      open={modalOpen}
      type={modalType}
      comment={comment}
      loading={loadingId === selectedLeaveId}
      onCommentChange={setComment}
      onSubmit={submitAction}
      onClose={() => {
        setModalOpen(false);
        setComment("");
      }}
    />

    <Footer />
  </>
);
}