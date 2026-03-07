import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Calendar,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  UserPlus2,
  RefreshCcw,
  X,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const statusConfig = {
  APPROVED: { icon: CheckCircle2, className: "bg-green-100 text-green-700 border-green-200" },
  PENDING: { icon: Clock, className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  REJECTED: { icon: XCircle, className: "bg-red-100 text-red-700 border-red-200" },
  FORWARDED: { icon: Clock, className: "bg-indigo-100 text-indigo-700 border-indigo-200" },
};

export default function LeaveTable({ leaves, currentYear, allFaculty }) {
  const [expandedId, setExpandedId] = useState(null);
  const [reassignModal, setReassignModal] = useState(null); // { leaveId, sub }

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?.id || currentUser?._id;

  const filteredLeaves = leaves.filter(
    (l) => new Date(l.startDate).getFullYear() === currentYear
  );

  /* ---------------- SMART REASSIGN HANDLER ---------------- */
  const handleReassign = async (leaveId, subId, newSubstituteId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/leave/reassign/${leaveId}/${subId}`,
        { newSubstituteId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReassignModal(null);
      alert("✅ Substitute updated successfully! Request sent.");
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  /* ---------------- ROBUST BUSY CHECK LOGIC ---------------- */
  const getFreeFaculty = (dateString, period) => {
    if (!dateString || !period) return [];

    const dateObj = new Date(dateString);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = days[dateObj.getDay()];

    return allFaculty.filter((f) => {
      // 1. Filter out yourself
      if (f._id === currentUserId) return false;

      if (f.role === "HOD") return false;
      // 2. Filter out the person who just declined (they are in the 'Retry' section)
      const declinedId = reassignModal?.sub?.substituteFaculty?._id || reassignModal?.sub?.substituteFaculty;
      if (f._id === declinedId) return false;

      // 3. Check timetable availability
      if (!f.timetable || !f.timetable[dayName]) return true; // Free if no timetable set

      const periodKey = period.toString();
      const subject = f.timetable[dayName][periodKey];

      // Free if subject is empty or only spaces
      return !subject || subject.trim() === "";
    });
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Leave Report - ${currentUser?.name || "Faculty"}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Year: ${currentYear} | Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 22);

    const tableData = filteredLeaves.map((l) => [
      l.leaveType,
      l.startDate.slice(0, 10),
      l.endDate.slice(0, 10),
      l.status,
      l.substitutions?.map(s => `P${s.period}: ${s.substituteFaculty?.name || 'NA'} (${s.status})`).join("\n") || "-",
      l.rejectionReason || "-"
    ]);

    autoTable(doc, {
      head: [["Type", "Start", "End", "Status", "Substitutions", "Remarks"]],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8, cellPadding: 2 },
    });
    doc.save(`Leave_Report_${currentYear}.pdf`);
  };

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 rounded-lg">
              <Calendar className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">My Leave Requests</h3>
          </div>
          <Button variant="outline" size="sm" onClick={downloadPDF} className="gap-2 text-xs border-gray-200">
            <Download className="w-3.5 h-3.5" /> Export PDF
          </Button>
        </div>

        {/* LIST */}
        <div className="divide-y divide-gray-50">
          {filteredLeaves.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">No leave requests found for this year.</div>
          ) : (
            filteredLeaves.map((leave) => {
              const sc = statusConfig[leave.status] || statusConfig.PENDING;
              const Icon = sc.icon;
              const expanded = expandedId === leave._id;

              return (
                <div key={leave._id} className="transition-all hover:bg-gray-50/50">
                  <button
                    onClick={() => setExpandedId(expanded ? null : leave._id)}
                    className="w-full px-6 py-5 flex items-center gap-4 text-left"
                  >
                    <div className="flex-1 grid md:grid-cols-4 gap-4 items-center">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{leave.leaveType}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{leave.reason}</p>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">
                        {new Date(leave.startDate).toLocaleDateString('en-IN', {day: '2-digit', month: 'short'})} → {new Date(leave.endDate).toLocaleDateString('en-IN', {day: '2-digit', month: 'short'})}
                      </p>
                      <Badge variant="outline" className={`w-fit text-[10px] uppercase tracking-wider px-2 py-0.5 ${sc.className}`}>
                        <Icon className="w-3 h-3 mr-1" /> {leave.status}
                      </Badge>
                      <p className="text-xs text-gray-400 italic">{leave.rejectionReason || "No remarks"}</p>
                    </div>
                    {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>

                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6">
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Substitution Details</p>
                            </div>
                            
                            <div className="grid gap-3">
                              {leave.substitutions.map((sub, i) => {
                                const isDeclined = sub.status === "DECLINED";
                                const facultyName = sub.substituteFaculty?.name || "Unknown Faculty";

                                return (
                                  <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-4">
                                      <div className="text-center min-w-[50px] border-r border-gray-100 pr-3">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">{new Date(sub.date).toLocaleDateString('en-IN', {weekday: 'short'})}</p>
                                        <p className="text-sm font-black text-teal-600">{new Date(sub.date).getDate()}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-gray-800">{facultyName}</p>
                                        <p className="text-[10px] text-gray-500">Period {sub.period} • {sub.substituteFaculty?.subject || 'Dept Faculty'}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                      <Badge variant="outline" className={`text-[9px] font-bold px-2 ${isDeclined ? "bg-red-50 text-red-600 border-red-100" : "bg-teal-50 text-teal-700 border-teal-100"}`}>
                                        {sub.status || "PENDING"}
                                      </Badge>
                                      
                                      {isDeclined && (
                                        <button 
                                          onClick={() => setReassignModal({ leaveId: leave._id, sub })}
                                          className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition shadow-sm border border-amber-100"
                                          title="Reassign this period"
                                        >
                                          <RefreshCcw className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* --- PREMIUM REASSIGN MODAL --- */}
      <AnimatePresence>
        {reassignModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
            >
              {/* Modal Header */}
              <div className="bg-teal-600 p-5 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <UserPlus2 className="w-5 h-5" />
                  <h4 className="font-bold tracking-tight">Update Substitute</h4>
                </div>
                <button 
                  onClick={() => setReassignModal(null)}
                  className="hover:bg-teal-700 p-1 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {/* Context Box */}
                <div className="mb-6 bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Declined Slot</p>
                    <p className="text-sm font-semibold text-amber-900">
                      {new Date(reassignModal.sub.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'long' })} • Period {reassignModal.sub.period}
                    </p>
                  </div>
                </div>

                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Select Available Faculty</p>
                
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {getFreeFaculty(reassignModal.sub.date, reassignModal.sub.period).length > 0 ? (
                    getFreeFaculty(reassignModal.sub.date, reassignModal.sub.period).map(f => (
                      <button
                        key={f._id}
                        onClick={() => handleReassign(reassignModal.leaveId, reassignModal.sub._id, f._id)}
                        className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-teal-500 hover:bg-teal-50 transition-all flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-sm font-bold text-gray-700 group-hover:text-teal-700">{f.name}</p>
                          <p className="text-[10px] text-gray-500">{f.subject || 'Faculty Member'}</p>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-teal-100 transition">
                          <UserPlus2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-teal-600" />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed">
                      <p className="text-xs text-gray-400">No other free faculty found for this slot.</p>
                    </div>
                  )}
                  
                  {/* Retry Original Option */}
                  <div className="pt-4 border-t border-gray-100 mt-4">
                    <p className="text-[10px] font-bold text-red-400 uppercase mb-2">Original Choice</p>
                    <button
                      onClick={() => handleReassign(reassignModal.leaveId, reassignModal.sub._id, reassignModal.sub.substituteFaculty?._id || reassignModal.sub.substituteFaculty)}
                      className="w-full text-left p-3 rounded-xl border border-red-50 bg-red-50/30 hover:bg-red-50 transition-all flex items-center justify-between"
                    >
                      <p className="text-sm font-bold text-red-800">Retry {reassignModal.sub.substituteFaculty?.name || 'Previous Faculty'}</p>
                      <RefreshCcw className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}