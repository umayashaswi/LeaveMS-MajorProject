import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Forward, X } from "lucide-react";
import { Button } from "./ui/button";

const typeConfig = {
  APPROVED: {
    icon: CheckCircle2,
    label: "Approve Leave",
    color: "bg-green-600 hover:bg-green-700 text-white",
  },
  REJECTED: {
    icon: XCircle,
    label: "Reject Leave",
    color: "bg-red-600 hover:bg-red-700 text-white",
  },
  FORWARDED: {
    icon: Forward,
    label: "Forward Leave",
    color: "bg-indigo-600 hover:bg-indigo-700 text-white",
  },
};

export default function ActionModal({
  open,
  type,
  comment,
  loading,
  onCommentChange,
  onSubmit,
  onClose,
}) {
  if (!type) return null;

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl border shadow-xl p-6 w-full max-w-md mx-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-semibold">
                  {config.label}
                </h3>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comment Field */}
            {type !== "APPROVED" && (
              <div className="mb-4">
                <label className="text-sm font-medium mb-1.5 block">
                  Comment{" "}
                  {(type === "REJECTED" || type === "FORWARDED") &&
                    "(required)"}
                </label>

                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  placeholder="Add your comment..."
                  value={comment}
                  onChange={(e) => onCommentChange(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>

              <Button
                onClick={onSubmit}
                disabled={loading}
                className={config.color}
              >
                {loading ? "Processing..." : "Confirm"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}