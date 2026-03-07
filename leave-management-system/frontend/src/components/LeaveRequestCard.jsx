import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Forward,
  Clock,
  BookOpen,
  CalendarDays,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusConfig = {
  APPROVED: {
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700 border-green-200",
  },
  PENDING: {
    icon: Clock,
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  REJECTED: {
    icon: XCircle,
    className: "bg-red-100 text-red-700 border-red-200",
  },
  FORWARDED: {
    icon: Forward,
    className: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
};

// 🔥 NEW: Colors for the Substitution Statuses
const subStatusConfig = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  ACCEPTED: "bg-green-100 text-green-700 border-green-200",
  DECLINED: "bg-red-100 text-red-700 border-red-200",
};

export default function LeaveRequestCard({
  leave,
  index = 0,
  loadingId,
  handleAction,
}) {
  const sc = statusConfig[leave.status];
  const StatusIcon = sc.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {/* HEADER */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-sm font-semibold text-white shadow-sm">
            {leave.faculty?.name?.charAt(0) || "F"}
          </div>

          <div>
            <p className="font-semibold text-sm text-gray-900">
              {leave.faculty?.name}
            </p>

            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
              <BookOpen className="w-3.5 h-3.5" />
              {leave.faculty?.subject}
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className={`text-xs flex items-center gap-1.5 px-2.5 py-1 ${sc.className}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {leave.status}
        </Badge>
      </div>

      {/* DETAILS */}
      <div className="space-y-3 mb-5 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-800">Type:</span>
          <Badge variant="secondary" className="text-xs px-2.5 py-0.5">
            {leave.leaveType}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <CalendarDays className="w-4 h-4" />
          {new Date(leave.startDate).toLocaleDateString()} →{" "}
          {new Date(leave.endDate).toLocaleDateString()}
        </div>

        <div className="flex items-start gap-2 text-gray-600">
          <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{leave.reason}</span>
        </div>
      </div>

      {/* SUBSTITUTIONS */}
      {leave.substitutions && leave.substitutions.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            Substitutions
          </p>

          <div className="space-y-2">
            {leave.substitutions.map((sub, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs bg-white rounded-lg px-3 py-2 border"
              >
                <span className="text-gray-500">
                  {new Date(sub.date).toLocaleDateString()}
                </span>

                <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                  P{sub.period}
                </Badge>

                <span className="font-medium text-gray-800">
                  {sub.substituteFaculty?.name}
                </span>

                <span className="text-gray-500">
                  ({sub.substituteFaculty?.subject})
                </span>

                {/* 🔥 NEW: Substitute Accept/Decline Status */}
                <Badge 
                  variant="outline" 
                  className={`ml-auto text-[10px] ${subStatusConfig[sub.status || "PENDING"]}`}
                >
                  {sub.status || "PENDING"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HOD COMMENT */}
      {leave.hodComment && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-5 text-xs text-gray-800">
          <span className="font-semibold">HOD Comment:</span> {leave.hodComment}
        </div>
      )}

      {/* ACTIONS */}
      {leave.status === "PENDING" && (
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button
            size="sm"
            onClick={() => handleAction(leave._id, "APPROVED")}
            disabled={loadingId === leave._id}
            className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle2 className="w-4 h-4" />
            {loadingId === leave._id ? "Processing..." : "Approve"}
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleAction(leave._id, "REJECTED")}
            disabled={loadingId === leave._id}
            className="gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction(leave._id, "FORWARDED")}
            disabled={loadingId === leave._id}
            className="gap-1.5 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
          >
            <Forward className="w-4 h-4" />
            Forward
          </Button>
        </div>
      )}
    </motion.div>
  );
}