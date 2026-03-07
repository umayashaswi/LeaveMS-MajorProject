import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Toaster, toast } from "react-hot-toast";
import FacultyNavbar from "../components/FacultyNavbar";
import { motion, AnimatePresence } from "framer-motion";
import collegeLogo from "../assets/college-logo.png";
import LeaveBalanceCard from "../components/LeaveBalanceCard";
import LeaveTable from "../components/LeaveTable";
import LeaveAnalyticsChart from "../components/LeaveAnalyticsChart";
import {
  Plus,
  X,
  Send,
  CalendarPlus,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  UserCheck,
} from "lucide-react";

/* ---------------- LEAVE LIMITS ---------------- */
const LEAVE_LIMITS = {
  Casual: 12,
  Vacation: 30,
  Medical: 15,
  Maternity: 182,
  Paternity: 15,
  Research: 365,
  Study: 730,
  Special: 10,
};

export default function DashboardFaculty() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const today = new Date();
  const currentYear = today.getFullYear();

  const currentDate = today.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const currentDay = today.toLocaleDateString("en-IN", {
    weekday: "long",
  });
  const hours = today.getHours();

  let greeting = "Good Morning";

  if (hours >= 12 && hours < 17) {
    greeting = "Good Afternoon";
  } else if (hours >= 17 && hours < 21) {
    greeting = "Good Evening";
  } else if (hours >= 21 || hours < 5) {
    greeting = "Good Night";
  }

  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  /* 🔥 NEW: Substitution Rows & Timetable State */
  const [substitutions, setSubstitutions] = useState([
    { date: "", period: "", substituteFaculty: "" },
  ]);
  const [myTimetable, setMyTimetable] = useState(null);

  const [leaves, setLeaves] = useState([]);

  const [subRequests, setSubRequests] = useState([]); // 👈 ADD THIS
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [allFaculty, setAllFaculty] = useState([]);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [activeRevokeData, setActiveRevokeData] = useState(null); // Stores {leaveId, subId}
  /* ---------------- FETCH FACULTY & TIMETABLE ---------------- */
  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        // 1. Fetch all faculty for dropdowns
        const resFaculty = await axios.get("http://localhost:5000/api/faculty/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllFaculty(resFaculty.data);

        // 2. Fetch MY profile to get MY timetable for auto-detection
        const resMe = await axios.get("http://localhost:5000/api/faculty/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resMe.data.timetable) {
          setMyTimetable(resMe.data.timetable);
        }
      } catch (err) {
        console.log("Failed to fetch data:", err.response?.data);
      }
    };

    fetchFacultyData();
  }, [token]);

  /* ---------------- AUTO-DETECT MISSED CLASSES ---------------- */
  useEffect(() => {
    // 1. Only run if we have dates and a timetable
    if (!form.startDate || !form.endDate || !myTimetable) return;

    // 2. 🔥 IMPORTANT: If the user is currently looking at a "PENDING" leave they already 
    // submitted, don't let this effect overwrite the data from the database.
    // We only auto-detect if the substitution list is empty or the user just changed dates.
    const isInitialLoad = substitutions.length > 0 && substitutions[0].substituteFaculty !== "";
    if (isInitialLoad && substitutions.length > 1) return; 

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);

    if (end < start) return;

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let autoSubstitutions = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayName = daysOfWeek[d.getDay()]; 
      if (!myTimetable[dayName]) continue;

      const daySchedule = myTimetable[dayName];
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      for (let p = 1; p <= 8; p++) {
        if (daySchedule[p] && daySchedule[p].trim() !== "") {
          autoSubstitutions.push({
            date: dateStr,
            period: p.toString(),
            substituteFaculty: "",
            status: "PENDING" // Add default status here too
          });
        }
      }
    }

    if (autoSubstitutions.length > 0) {
      setSubstitutions(autoSubstitutions);
    }
  }, [form.startDate, form.endDate, myTimetable]);

  const [dynamicAvailableFaculty, setDynamicAvailableFaculty] = useState([]);

const fetchLiveAvailability = async (index, date, period) => {
  if (!date || !period) return;
  try {
    const res = await axios.get(`http://localhost:5000/api/leave/available-faculty?date=${date}&period=${period}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Store results in a way that maps to the specific row index
    setDynamicAvailableFaculty(prev => ({ ...prev, [index]: res.data }));
  } catch (err) {
    console.error("Failed to check live availability", err);
  }
};
  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    if (!user || user.role !== "Faculty") {
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate, user]);

  /* ---------------- FETCH LEAVES ---------------- */
  const fetchMyLeaves = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leave/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaves(res.data);

      // 2. Fetch requests where I am the substitute 👈 NEW
      const resSubs = await axios.get("http://localhost:5000/api/leave/substitutions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubRequests(resSubs.data);

    } catch (error) {
       console.error("Error fetching leaves", error);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
    const interval = setInterval(fetchMyLeaves, 15000);
    return () => clearInterval(interval);
  }, []);

  /* ---------------- HANDLE SUB RESPONSE ---------------- */
const handleSubResponse = async (leaveId, subId, status) => {
  try {
    // 1. Optimistic UI update
    setSubRequests((prevRequests) =>
      prevRequests.map((leave) => {
        if (leave._id === leaveId) {
          return {
            ...leave,
            substitutions: leave.substitutions.map((sub) =>
              sub._id === subId ? { ...sub, status: status } : sub
            ),
          };
        }
        return leave;
      })
    );

    // 2. Send to backend
    await axios.put(
      `http://localhost:5000/api/leave/substitution/${leaveId}/${subId}`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // 3. 🔥 SHOW TOAST NOTIFICATION
    if (status === "ACCEPTED") {
      toast.success("Substitution commitment accepted!");
    } else if (status === "DECLINED") {
      // This handles both the initial 'Decline' and the 'Revoke' action
      toast.success("Substitution revoked. You are now free for this period.");
    }

  } catch (err) {
    console.error("Backend Error:", err);
    toast.error(err.response?.data?.message || "Failed to update status");
    // Re-fetch to sync UI back to server state on error
    fetchMyLeaves();
  }
};
  /* ---------------- APPLY LEAVE ---------------- */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  
  /* 🔥 Substitution Handlers */
  const handleSubChange = (index, e) => {
    const updated = [...substitutions];
    updated[index][e.target.name] = e.target.value;
    setSubstitutions(updated);
  };

  const addSubRow = () => {
    setSubstitutions([
      ...substitutions,
      { date: "", period: "", substituteFaculty: "" },
    ]);
  };

  const removeSubRow = (index) => {
    const updated = substitutions.filter((_, i) => i !== index);
    setSubstitutions(updated);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
       await axios.post(
        "http://localhost:5000/api/leave/apply",
        { ...form, substitutions }, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("✅ Leave request submitted");
      setForm({
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
      });

      setSubstitutions([{ date: "", period: "", substituteFaculty: "" }]);
      fetchMyLeaves();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to apply leave");
    }
  };

  /* ---------------- YEAR-WISE LEAVE BALANCE ---------------- */
  const usedLeaves = {};

  leaves
    .filter(
      (l) =>
        l.status === "APPROVED" &&
        new Date(l.startDate).getFullYear() === currentYear
    )
    .forEach((l) => {
      const days =
        (new Date(l.endDate) - new Date(l.startDate)) /
          (1000 * 60 * 60 * 24) +
        1;

      usedLeaves[l.leaveType] =
        (usedLeaves[l.leaveType] || 0) + days;
    });
    
/* ---------------- MONTHLY ANALYTICS ---------------- */
const monthlyCounts = Array(12).fill(0);

leaves
  .filter(
    (l) =>
      l.status === "APPROVED" &&
      new Date(l.startDate).getFullYear() === currentYear
  )
  .forEach((l) => {
    const start = new Date(l.startDate);
    const end = new Date(l.endDate);

    for (
      let d = new Date(start);
      d <= end;
      d.setDate(d.getDate() + 1)
    ) {
      if (d.getFullYear() === currentYear) {
        monthlyCounts[d.getMonth()]++;
      }
    }
  });

const monthlyData = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
].map((month, index) => ({
  month,
  leaves: monthlyCounts[index],
}));


/* ---------------- QUICK STATS ---------------- */
const totalApplied = leaves.filter(
  (l) => new Date(l.startDate).getFullYear() === currentYear
).length;

const pendingCount = leaves.filter(
  (l) =>
    l.status === "PENDING" &&
    new Date(l.startDate).getFullYear() === currentYear
).length;

const approvedCount = leaves.filter(
  (l) =>
    l.status === "APPROVED" &&
    new Date(l.startDate).getFullYear() === currentYear
).length;

const rejectedCount = leaves.filter(
  (l) =>
    l.status === "REJECTED" &&
    new Date(l.startDate).getFullYear() === currentYear
).length;

const STATS = [
  {
    label: "Total Applied",
    value: totalApplied,
    icon: CalendarDays,
    color: "text-primary",
  },
  {
    label: "Pending",
    value: pendingCount,
    icon: Clock,
    color: "text-yellow-600",
  },
  {
    label: "Approved",
    value: approvedCount,
    icon: CheckCircle2,
    color: "text-green-600",
  },
  {
    label: "Rejected",
    value: rejectedCount,
    icon: XCircle,
    color: "text-destructive",
  },
];

/* ---------------- PDF ---------------- */
const downloadPDF = (e) => {
  e.preventDefault();
  e.stopPropagation();

  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text(`Faculty Leave Report - ${user.name}`, 14, 15);
  doc.setFontSize(10);
  doc.text(`Year: ${currentYear}`, 14, 22);
  doc.text(`Generated on: ${currentDate}`, 14, 28);

  const tableData = leaves
    .filter(l => new Date(l.startDate).getFullYear() === currentYear)
    .map(l => {
      const start = l.startDate?.slice(0,10) || "-";
      const end = l.endDate?.slice(0,10) || "-";
      const substitutionText = (l.substitutions && l.substitutions.length > 0)
        ? l.substitutions.map(sub => {
            const date = sub.date?.slice(0,10) || "-";
            const facultyObj = allFaculty.find(f => f._id === sub.substituteFaculty);
            const name = facultyObj?.name || "Not Assigned";
            return `${date} | P${sub.period} | ${name}`;
          }).join("\n")
        : "-";

      return [
        l.leaveType || "-",
        start,
        end,
        l.status || "-",
        substitutionText,
        l.rejectionReason || "-"
      ];
    });

  autoTable(doc, {
    head: [["Type", "Start", "End", "Status", "Substitutions", "Remarks"]],
    body: tableData,
    startY: 35,
    styles: { fontSize: 9, cellPadding: 3, overflow: "linebreak" },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 22 },
      2: { cellWidth: 22 },
      3: { cellWidth: 25 },
      4: { cellWidth: 55 },
      5: { cellWidth: 35 },
    },
  });

  doc.save(`Faculty-Leave-Report-${currentYear}.pdf`);
};

  /* ---------------- SMART FACULTY FILTERING ---------------- */
  const getAvailableFaculty = (dateString, period) => {
    // If date or period isn't selected yet, just return everyone (except yourself)
    if (!dateString || !period) {
      return allFaculty.filter(f => f._id !== user.id &&
        f.role?.toUpperCase()!=="HOD"
      );
    }

    const dateObj = new Date(dateString);
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = daysOfWeek[dateObj.getDay()];

    return allFaculty.filter((f) => {
      // 1. You cannot substitute for yourself
      if (f._id === user.id) return false;
      if (f.role?.toUpperCase() === "HOD") return false;
      // 2. If they haven't set up a timetable yet, assume they are free
      if (!f.timetable || !f.timetable[dayName]) return true;

      const subjectInPeriod = f.timetable[dayName][period];

      // 3. If there is text in that period, THEY ARE BUSY! Filter them out.
      if (subjectInPeriod && subjectInPeriod.trim() !== "") {
        return false; 
      }

      // Otherwise, they are free!
      return true;
    });
  };

  return (
    <> {/* --- CUSTOM REVOKE MODAL --- */}
<AnimatePresence>
  {showRevokeModal && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center"
      >
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
          <XCircle className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Revoke Substitution?</h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          This action will cancel your commitment for this class. You will then be eligible to apply for leave on this date.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              handleSubResponse(activeRevokeData.leaveId, activeRevokeData.subId, "DECLINED");
              setShowRevokeModal(false);
            }}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-100"
          >
            Yes, Revoke Duty
          </button>
          <button
            onClick={() => setShowRevokeModal(false)}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors"
          >
            Keep Commitment
          </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
      <FacultyNavbar />
      <Toaster position="top-right" reverseOrder={false} />
      <div className="pt-28 px-8 bg-gradient-to-br from-teal-50 to-white min-h-screen">

        {/* PREMIUM WHITE HERO HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl mb-8 p-8 bg-white border border-gray-200 shadow-lg"
        >
          <div className="flex justify-between items-center">

            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-800">
                {greeting}, {user?.name}
                <motion.span
                  animate={{ rotate: [0, 20, -10, 20, 0] }}
                  transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                  className="inline-block ml-2"
                >
                  👋
                </motion.span>
              </h1>

              <p className="text-sm text-gray-500 mt-2">
                {currentDay}, {currentDate}
              </p>
            </div>

            <div className="bg-teal-600 text-white px-5 py-3 rounded-xl font-semibold shadow-md">
              Leave Year: {currentYear}
            </div>

          </div>
        </motion.div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-md flex items-center gap-4"
            >
              <div className="p-2.5 rounded-lg bg-gray-100">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

       {/* LEAVE BALANCES */}

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Leave Balances
          </h3>
        </div>

        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4 mb-8">
          {Object.keys(LEAVE_LIMITS)
            .filter((type) => {
              if (
                type === "Maternity" &&
                (user.gender !== "Female" ||
                  user.maritalStatus !== "Married")
              ) return false;

              if (
                type === "Paternity" &&
                (user.gender !== "Male" ||
                  user.maritalStatus !== "Married")
              ) return false;

              return true;
            })
            .map((type, index) => (
              <LeaveBalanceCard
                key={type}
                type={type}
                used={usedLeaves[type] || 0}
                total={LEAVE_LIMITS[type]}
                index={index}
              />
            ))}
        </div>
{/* 🔥 UPDATED: SUBSTITUTION REQUESTS FOR ME 🔥 */}
{subRequests.length > 0 && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-indigo-100"
  >
    <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4">
      <div className="flex items-center gap-3">
        <UserCheck className="w-5 h-5 text-white" />
        <h3 className="text-lg font-semibold text-white">Substitution Requests</h3>
      </div>
      <div className="mt-2 bg-indigo-900/30 p-2 rounded text-[11px] text-indigo-100 space-y-1">
        <p>• <b>Clash Rule:</b> You cannot accept multiple substitutions for the same Date & Period.</p>
        <p>• <b>Leave Rule:</b> Accepted substitutions block your own leave. Use "Revoke" if needed.</p>
      </div>
    </div>

    <div className="p-6">
      <div className="space-y-4">
        {subRequests.map((leave) => {
          // Safety check: ensure leave and substitutions exist
          if (!leave || !leave.substitutions) return null;

          const mySubs = leave.substitutions.filter(s => {
            const subId = s.substituteFaculty?._id || s.substituteFaculty;
            return subId === user?.id || subId === user?._id;
          });

          const isLeaveRejected = leave.status === "REJECTED";

          return mySubs.map((sub, idx) => {
            const currentStatus = sub.status || "PENDING";

            const hasExistingCommitment = subRequests.some(otherLeave =>
              otherLeave.substitutions?.some(otherSub =>
                (otherSub.substituteFaculty?._id === (user?.id || user?._id) || otherSub.substituteFaculty === (user?.id || user?._id)) &&
                otherSub.status === "ACCEPTED" &&
                otherSub.date === sub.date &&
                otherSub.period === sub.period &&
                otherSub._id !== sub._id
              )
            );

            return (
              <div key={`${leave._id}-${idx}`} className={`flex items-center justify-between p-4 rounded-lg border transition-all ${isLeaveRejected ? "bg-gray-100 opacity-60" : "bg-gray-50 border-gray-200"}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800">{leave.faculty?.name || "Faculty"}</p>
                    {isLeaveRejected && <Badge className="bg-red-50 text-red-600 border-red-200 text-[10px]">Cancelled</Badge>}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="font-medium text-indigo-700">{new Date(sub.date).toLocaleDateString("en-IN")}</span> • Period {sub.period}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {currentStatus === "PENDING" && !isLeaveRejected ? (
                    hasExistingCommitment ? (
                      <div className="text-right">
                        <span className="text-[10px] text-amber-600 font-bold block uppercase">Period Busy</span>
                        <button disabled className="bg-gray-200 text-gray-400 px-3 py-1.5 rounded-md text-xs font-semibold cursor-not-allowed">
                          Clashed
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleSubResponse(leave._id, sub._id, "ACCEPTED")} 
                          className="bg-green-600 text-white hover:bg-green-700 px-3 py-1.5 rounded-md text-xs font-semibold transition shadow-sm"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleSubResponse(leave._id, sub._id, "DECLINED")} 
                          className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md text-xs font-semibold transition"
                        >
                          Decline
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-md ${currentStatus === "ACCEPTED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {currentStatus}
                      </span>

                      {currentStatus === "ACCEPTED" && !isLeaveRejected && (
                        <button 
    onClick={() => {
      setActiveRevokeData({ leaveId: leave._id, subId: sub._id });
      setShowRevokeModal(true);
    }}
    className="text-[10px] text-red-500 font-bold hover:underline px-1 uppercase tracking-wider"
  >
    Revoke?
  </button>
)}</div>)}
                </div>
              </div>
            );
          });
        })}
      </div>
    </div>
  </motion.div>
)}
        {/* APPLY LEAVE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-800 px-6 py-4 flex items-center gap-3">
            <CalendarPlus className="w-5 h-5 text-white" />
            <h3 className="text-lg font-semibold text-white">
              Apply for Leave
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-100 text-green-700 px-4 py-3 rounded-lg text-sm"
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            {/* Leave Type + Dates */}
            <div className="grid md:grid-cols-3 gap-4">

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  LEAVE TYPE
                </label>

                <select
                  name="leaveType"
                  value={form.leaveType}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select Leave Type</option>
                  {Object.keys(LEAVE_LIMITS)
                    .filter((type) => {
                      if (
                        type === "Maternity" &&
                        (user.gender !== "Female" || user.maritalStatus !== "Married")
                      ) return false;

                      if (
                        type === "Paternity" &&
                        (user.gender !== "Male" || user.maritalStatus !== "Married")
                      ) return false;

                      return true;
                    })
                    .map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  START DATE
                </label>

                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  min={`${currentYear}-01-01`}
                  max={`${currentYear}-12-31`}
                  required
                  className="input"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  END DATE
                </label>

                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  min={`${currentYear}-01-01`}
                  max={`${currentYear}-12-31`}
                  required
                  className="input"
                />
              </div>
            </div>

            {/* Reason */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                REASON
              </label>

              <textarea
                name="reason"
                placeholder="Briefly describe your reason..."
                value={form.reason}
                onChange={handleChange}
                className="input w-full"
                rows={3}
              />
            </div>

            {/* Substitution Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold text-gray-600 uppercase">
                  Substitution Details
                </h4>

                <button
                  type="button"
                  onClick={addSubRow}
                  className="flex items-center gap-1 text-sm text-teal-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Period
                </button>
              </div>

              <AnimatePresence>
                {substitutions.map((sub, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid md:grid-cols-[1fr_80px_1fr_40px] gap-3 items-end mb-3"
                  >

                    <input
                      type="date"
                      name="date"
                      value={sub.date}
                      onChange={(e) =>{ handleSubChange(index, e);
                        fetchLiveAvailability(index, e.target.value, sub.period);
  }
                      }
                      className="input"
                      required
                    />

                    <input
                      type="number"
                      name="period"
                      placeholder="Period"
                      value={sub.period}
                      onChange={(e) => {handleSubChange(index, e);
                      fetchLiveAvailability(index, sub.date, e.target.value);
  }

                      }
                      className="input"
                      required
                    />

                    <select
                      name="substituteFaculty"
                      value={sub.substituteFaculty}
                      onChange={(e) => handleSubChange(index, e)}
                      className="input"
                      required
                    >
                     <option value="">Select Available Faculty</option>
                      
                      {/* 🔥 USE DYNAMIC DATA IF AVAILABLE, OTHERWISE FALLBACK TO SMART FILTER */}
  {(dynamicAvailableFaculty[index] || getAvailableFaculty(sub.date, sub.period)).map((f) => (
    <option key={f._id} value={f._id}>
      {f.name} ({f.subject || "Faculty"})
    </option>
  ))}
</select>

                    {substitutions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubRow(index)}
                        className="p-2 text-gray-500 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-md transition-all duration-300"
            >
              <Send className="w-4 h-4" />
              Submit Leave Application
            </button>

          </form>
        </motion.div>

        {/* MY LEAVES */}
        <div className="mt-8">
          <LeaveTable
            leaves={leaves}
            currentYear={currentYear}
            allFaculty={allFaculty}
          />
        </div>
        {/* ANALYTICS */}
        <div className="mt-8">
          <LeaveAnalyticsChart monthlyCounts={monthlyData} />
        </div>
      </div>

      <style>
        {`
          .input {
            padding: 10px;
            border-radius: 8px;
            border: 1px solid #d1d5db;
          }
          .input:focus {
            outline: none;
            border-color: #0f766e;
          }
        `}
      </style>
    </>
  );
}