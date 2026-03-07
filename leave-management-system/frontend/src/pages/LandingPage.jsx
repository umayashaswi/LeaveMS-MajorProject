import { motion } from "framer-motion";
import { Zap, Bell, Calendar, ArrowRight, Shield, BarChart3, Users } from "lucide-react";
import { Link } from "react-router-dom";
import LandingNavbar from "@/components/Navbar"; // Keep your imports as requested
import LandingFooter from "@/components/Footer"; // Keep your imports as requested

const STATS = [
  { value: "2 min", label: "Apply Leave" },
  { value: "1 Click", label: "Approval" },
  { value: "100%", label: "Paperless" },
  { value: "24/7", label: "Tracking" },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Quick Leave Application",
    desc: "Faculty can submit leave requests in minutes using a simple and intuitive form.",
  },
  {
    icon: Bell,
    title: "Role-Based Approval",
    desc: "Department heads receive instant notifications and can approve with one click.",
  },
  {
    icon: Calendar,
    title: "Real-Time Tracking",
    desc: "Track leave status, balances and history anytime in one dashboard.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    desc: "Role-based access control ensures only authorized users manage leave data.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    desc: "Visual charts and exportable reports for department-wise leave insights.",
  },
  {
    icon: Users,
    title: "Multi-Role Support",
    desc: "Separate dashboards for Faculty, HOD, and Admin with tailored workflows.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      <LandingNavbar />

      {/* HERO */}
      <section className="relative pt-32 pb-32 sm:pt-40 sm:pb-36 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-48 -right-48 w-[600px] h-[600px] rounded-full bg-teal-500 blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.1, 0.04] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full bg-teal-500 blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-slate-200 blur-3xl"
          />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle, #0d9488 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/60 text-teal-700 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-teal-100 shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              Faculty Leave Management Platform
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Manage Leave,
              <br />
              <span className="text-teal-600">Effortlessly.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
              A centralized platform for faculty to apply, approve and track leave — fast, paperless, and beautifully simple.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 justify-center items-center"
            >
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-teal-500/30 hover:opacity-90 transition-all hover:scale-[1.02]"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-3.5 rounded-xl font-semibold border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-24"
          >
            {STATS.map((item, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                className="relative bg-white/70 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-left shadow-sm group hover:shadow-xl hover:shadow-teal-500/10 transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-teal-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                <p className="text-2xl sm:text-3xl font-bold text-teal-600 relative z-10">
                  {item.value}
                </p>
                <p className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold mt-1.5 relative z-10">
                  {item.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-28 relative" id="features">
        <div className="absolute inset-0 bg-slate-100/50 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 space-y-3"
          >
            <p className="text-xs uppercase tracking-widest text-teal-600 font-semibold">
              Why LeaveMS?
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Everything You Need
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Built for faculty and admins — designed to make leave management feel seamless.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-white/70 backdrop-blur-md border border-white/20 rounded-2xl p-7 shadow-sm hover:shadow-xl hover:shadow-teal-500/10 transition-all group hover:-translate-y-1 duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-teal-500 to-teal-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md">
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-28">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 space-y-3"
          >
            <p className="text-xs uppercase tracking-widest text-teal-600 font-semibold">
              Simple Process
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              How It Works
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-0.5 bg-slate-200" />
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Apply", desc: "Faculty fills a quick leave form with dates and reason." },
                { step: "02", title: "Review", desc: "HOD gets notified and approves, rejects, or forwards." },
                { step: "03", title: "Track", desc: "Everyone sees real-time status and leave balances." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-teal-700 text-white font-bold text-sm flex items-center justify-center mx-auto mb-5 shadow-md relative z-10">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-teal-500 to-teal-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl shadow-teal-600/30 relative overflow-hidden"
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
                Ready to Get Started?
              </h2>
              <p className="text-teal-50 text-sm mb-8 max-w-md mx-auto">
                Join the platform and manage your leave workflow in minutes — clean, fast, and hassle-free.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-teal-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-slate-50 transition-all shadow-md hover:scale-[1.02]"
              >
                Create Your Account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}