import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Check,
  X,
  ArrowRight,
  TrendingUp,
  Building2,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import AdminNavbar from "../components/AdminNavbar";
import { Badge } from "@/components/ui/badge";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

export default function DashboardAdmin() {
  const token = localStorage.getItem("token");
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    byDepartment: [],
  });
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [leaveRes, statRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/leaves", { headers }),
        axios.get("http://localhost:5000/api/admin/stats", { headers }),
      ]);
      setLeaves(leaveRes.data);
      setStats(statRes.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  const takeAction = async (id, status) => {
    const comment = status === "REJECTED" ? prompt("Enter rejection reason") : "";
    if (status === "REJECTED" && comment === null) return;

    setLoadingId(id);
    try {
      await axios.put(
        `http://localhost:5000/api/admin/leave/${id}`,
        { status, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAll();
    } catch (error) {
      alert("Failed to update leave status");
    } finally {
      setLoadingId(null);
    }
  };

  const forwardedLeaves = leaves.filter((l) => l.status === "FORWARDED");

  const statCards = [
    { key: "total", label: "Total Requests", icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
    { key: "pending", label: "Pending", icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
    { key: "approved", label: "Approved", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
    { key: "rejected", label: "Rejected", icon: XCircle, color: "text-rose-600", bg: "bg-rose-100" },
  ];

  const PIE_DATA = [
    { name: "Approved", value: stats.approved || 0, color: "#10b981" },
    { name: "Pending", value: stats.pending || 0, color: "#f59e0b" },
    { name: "Rejected", value: stats.rejected || 0, color: "#f43f5e" },
  ];

  return (
    <>
      <AdminNavbar />

      <div className="min-h-screen bg-slate-50 pt-28 pb-12">
        {/* Decorative Background */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-teal-500/5 blur-3xl" />
          <div className="absolute bottom-20 -left-32 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
              <p className="text-slate-500 mt-1">Manage and oversee all leave requests across departments</p>
            </div>
            <Badge variant="outline" className="w-fit flex items-center gap-1.5 px-3 py-1.5 border-teal-200 bg-teal-50 text-teal-700">
              <Users className="w-3.5 h-3.5" />
              {forwardedLeaves.length} forwarded requests
            </Badge>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.key}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <TrendingUp className="w-4 h-4 text-slate-300" />
                </div>
                <p className="text-3xl font-bold text-slate-900">{stats[stat.key] ?? 0}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Bar Chart */}
            <motion.div
              custom={4}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Building2 className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-semibold text-slate-800">Department Leave Distribution</h3>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={stats.byDepartment || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} allowDecimals={false} />
                    <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Leaves">
                      {(stats.byDepartment || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#0d9488" : "#2dd4bf"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Pie Chart */}
            <motion.div
              custom={5}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-semibold text-slate-800">Status Overview</h3>
              </div>
              <div className="p-6 flex flex-col items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" strokeWidth={0}>
                      {PIE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-1 gap-2 mt-4 w-full">
                  {PIE_DATA.map((s) => (
                    <div key={s.name} className="flex items-center justify-between px-3 py-1 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-xs text-slate-600">{s.name}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-800">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Forwarded Leaves List */}
<motion.div
  custom={6}
  initial="hidden"
  animate="visible"
  variants={fadeUp}
  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
>
  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
    <div className="flex items-center gap-3">
      <ArrowRight className="w-5 h-5 text-teal-600" />
      <h3 className="text-lg font-semibold text-slate-800">Forwarded Requests</h3>
    </div>
  </div>

  <div className="divide-y divide-slate-100">
    {forwardedLeaves.length === 0 ? (
      <div className="p-16 text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <p className="text-slate-500 font-medium text-lg">All caught up!</p>
        <p className="text-slate-400 text-sm">No pending forwarded requests to review.</p>
      </div>
    ) : (
      forwardedLeaves.map((l, i) => (
        <motion.div
          key={l._id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="p-6 hover:bg-slate-50 transition-colors"
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-teal-200 shrink-0">
                  {l.faculty?.name?.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg leading-tight">{l.faculty?.name}</h4>
                  <p className="text-sm text-slate-500 font-medium">
                    {l.faculty?.subject} • <span className="text-teal-600">{l.faculty?.department}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 ml-16">
                <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none px-3 py-1">
                  {l.leaveType}
                </Badge>
                <div className="flex items-center gap-1.5 text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(l.startDate).toLocaleDateString()} → {new Date(l.endDate).toLocaleDateString()}
                </div>
              </div>

              {/* 🔥 UPDATED: HOD Remark without italic class 🔥 */}
              {l.hodComment && (
                <div className="mt-4 ml-16 p-4 rounded-xl bg-teal-50/50 border border-teal-100 relative">
                  <div className="absolute top-0 left-4 -translate-y-1/2 bg-white px-2 text-[10px] font-bold text-teal-600 uppercase tracking-widest">
                    HOD Remark
                  </div>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">
                    {l.hodComment}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 ml-16 lg:ml-0 shrink-0">
              <button
                onClick={() => takeAction(l._id, "APPROVED")}
                disabled={loadingId === l._id}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Approve
              </button>
              <button
                onClick={() => takeAction(l._id, "REJECTED")}
                disabled={loadingId === l._id}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-rose-200 text-rose-600 text-sm font-bold hover:bg-rose-50 transition-all disabled:opacity-50"
              >
                <X className="w-4 h-4 stroke-[3]" />
                Reject
              </button>
            </div>
          </div>
        </motion.div>
      )
    ))}
  </div>
</motion.div>
        </div>
      </div>
    </>
  );
}