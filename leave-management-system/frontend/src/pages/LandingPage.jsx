import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { PlayCircle, Zap, Bell, Calendar } from "lucide-react";

export default function LandingPage() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-24 bg-slate-50 text-center">
        <div className="max-w-6xl mx-auto px-6 space-y-10">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900">
            Smart <span className="text-teal-600">Leave</span> Management System
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto">
            A simple and centralized platform for faculty to apply, approve and
            track leave efficiently — built as a college project.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition">
              Get Started
            </button>

            <button className="flex items-center gap-2 border-2 border-slate-200 px-8 py-4 rounded-2xl font-semibold hover:bg-slate-100 transition">
              <PlayCircle size={20} />
              View Demo
            </button>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16">
            {[
              { value: "2 min", label: "Apply Leave" },
              { value: "1 Click", label: "Approval" },
              { value: "100%", label: "Paperless" },
              { value: "24/7", label: "Tracking" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-8 shadow text-left"
              >
                <p className="text-3xl font-bold text-teal-600">
                  {item.value}
                </p>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mt-2">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-white" id="features">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900">
              Everything You Need
            </h2>
            <p className="uppercase tracking-widest text-xs text-slate-400 font-bold mt-3">
              Built for Faculty & Admins
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Feature
              icon={<Zap className="text-teal-600" size={32} />}
              title="Quick Leave Application"
              desc="Faculty can submit leave requests in minutes using a simple and intuitive form."
            />

            <Feature
              icon={<Bell className="text-teal-600" size={32} />}
              title="Role-Based Approval"
              desc="Department heads receive instant notifications and can approve with one click."
            />

            <Feature
              icon={<Calendar className="text-teal-600" size={32} />}
              title="Real-Time Tracking"
              desc="Track leave status, balances and history anytime in one dashboard."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <h2 className="text-4xl md:text-5xl font-extrabold">
            Built for College Projects
          </h2>

          <p className="text-slate-400">
            No payments. No marketing. Just clean UI + solid functionality.
          </p>

          <button className="bg-teal-600 px-10 py-4 rounded-2xl font-bold hover:opacity-90 transition">
            Explore Dashboard
          </button>
        </div>
      </section>

      <Footer />
    </>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="p-10 rounded-3xl border border-slate-100 hover:border-teal-200 hover:shadow-lg transition">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-8">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3 text-slate-900">
        {title}
      </h3>
      <p className="text-slate-500">{desc}</p>
    </div>
  );
}
