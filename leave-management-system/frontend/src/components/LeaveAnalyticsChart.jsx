import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function LeaveAnalyticsChart({ monthlyCounts }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="bg-card rounded-xl border border-border shadow-soft overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-border flex items-center gap-3">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Monthly Leave Analytics ({currentYear})
        </h3>
      </div>

      <div className="p-6">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyCounts}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="leaves" radius={[6, 6, 0, 0]}>
              {monthlyCounts.map((_, index) => (
                <Cell
                  key={index}
                  fill={
                    index <= currentMonth
                      ? "hsl(168 70% 32%)"
                      : "hsl(160 15% 88%)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}