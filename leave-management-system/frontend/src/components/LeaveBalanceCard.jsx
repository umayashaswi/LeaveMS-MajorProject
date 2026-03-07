import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function LeaveBalanceCard({ type, used, total, index }) {
  const remaining = total - used;
  const percentage = (used / total) * 100;

  const getStatus = () => {
    if (percentage >= 80)
      return {
        icon: TrendingDown,
        color: "text-destructive",
        bg: "bg-destructive/10",
      };
    if (percentage >= 50)
      return {
        icon: TrendingUp,
        color: "text-yellow-500",
        bg: "bg-yellow-100",
      };
    return {
      icon: Minus,
      color: "text-green-600",
      bg: "bg-green-100",
    };
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="group bg-card rounded-xl border border-border p-5 shadow hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-semibold text-foreground">{type}</h4>
        <div className={`p-1.5 rounded-md ${status.bg}`}>
          <Icon className={`w-4 h-4 ${status.color}`} />
        </div>
      </div>

      <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            delay: index * 0.05 + 0.3,
            duration: 0.6,
            ease: "easeOut",
          }}
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-700"
        />
      </div>

      <div className="flex items-baseline justify-between">
        <p className="text-xs text-muted-foreground">
          {used} / {total} used
        </p>
        <p className="text-sm font-bold text-foreground">
          {remaining} left
        </p>
      </div>
    </motion.div>
  );
}