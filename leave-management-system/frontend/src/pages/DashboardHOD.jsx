import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Navbar from "../components/HodNavbar";
import Footer from "../components/Footer";
import { Bar } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  UilClipboardNotes,
  UilCheckCircle,
  UilShare,
  UilCalendarAlt,
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

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function DashboardHOD() {
  const token = localStorage.getItem("token");

  const [leaves, setLeaves] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [lock, setLock] = useState({ startDate: null, endDate: null, reason: "" });

  const [activeTab, setActiveTab] = useState("PENDING");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 5;

  const leaveRef = useRef(null);

  useEffect(() => {
    fetchLeaves();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  /* ---------------- FETCH DATA ---------------- */

  const fetchLeaves = async () => {
    const res = await axios.get("http://localhost:5000/api/leave/hod", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLeaves(res.data);
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

  /* ---------------- ACTIONS ---------------- */

  const takeAction = async (id, status) => {
    const hodComment = status !== "APPROVED" ? prompt("Add comment (optional)") : "";
    await axios.put(
      `http://localhost:5000/api/leave/${id}/action`,
      { status, hodComment },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchLeaves();
  };

  const forwardToAdmin = async (id) => {
    const comment = prompt("Reason to forward to Admin");
    if (!comment) return;

    await axios.put(
      `http://localhost:5000/api/leave/${id}/forward`,
      { comment },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchLeaves();
  };

  const lockLeaves = async () => {
    if (lock.startDate && lock.endDate && lock.endDate < lock.startDate) {
      alert("End date cannot be before start date");
      return;
    }

    await axios.post(
      "http://localhost:5000/api/locked/create",
      {
        startDate: lock.startDate?.toISOString().split("T")[0] || "",
        endDate: lock.endDate?.toISOString().split("T")[0] || "",
        reason: lock.reason,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Leave period locked");
    setLock({ startDate: null, endDate: null, reason: "" });
  };

  /* ---------------- FILTERING & PAGINATION ---------------- */

  const pendingLeaves = leaves.filter(l => l.status === "PENDING");
  const acceptedLeaves = leaves.filter(l => l.status === "APPROVED");
  const forwardedLeaves = leaves.filter(l => l.status === "FORWARDED");

  const tabMap = {
    PENDING: pendingLeaves,
    APPROVED: acceptedLeaves,
    FORWARDED: forwardedLeaves,
  };

  const activeLeaves = tabMap[activeTab] || [];
  const totalPages = Math.ceil(activeLeaves.length / ITEMS_PER_PAGE);

  const paginatedLeaves = activeLeaves.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ---------------- ANALYTICS ---------------- */

  const chartData = {
    labels: analytics.map(a => a.month),
    datasets: [
      {
        label: "Department Leaves",
        data: analytics.map(a => a.count),
        backgroundColor: "#2563eb",
      },
    ],
  };

  /* ---------------- UI ---------------- */

  return (
    <>
      <Navbar leaveRef={leaveRef} />

      <div className="min-h-screen bg-slate-50 px-6 py-10 space-y-10">

        {/* -------- LEAVE REQUESTS -------- */}
        <div ref={leaveRef} className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <UilClipboardNotes /> Leave Requests
          </h2>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <TabButton
              icon={<UilClipboardNotes />}
              label="Pending"
              active={activeTab === "PENDING"}
              onClick={() => setActiveTab("PENDING")}
            />
            <TabButton
              icon={<UilCheckCircle />}
              label="Accepted"
              active={activeTab === "APPROVED"}
              onClick={() => setActiveTab("APPROVED")}
            />
            <TabButton
              icon={<UilShare />}
              label="Forwarded"
              active={activeTab === "FORWARDED"}
              onClick={() => setActiveTab("FORWARDED")}
            />
          </div>

          {/* Leave Cards */}
          {paginatedLeaves.length === 0 ? (
            <p className="text-gray-500">No requests found</p>
          ) : (
            <div className="grid gap-4">
              {paginatedLeaves.map(l => (
                <LeaveCard
                  key={l._id}
                  leave={l}
                  takeAction={takeAction}
                  forwardToAdmin={forwardToAdmin}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-end items-center gap-4 mt-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* -------- LEAVE HEATMAP -------- */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <UilCalendarAlt /> Leave Heatmap
          </h3>
          <div className="h-40 flex items-center justify-center border rounded-lg text-gray-400">
            Heatmap visualization goes here
          </div>
        </div>

        {/* -------- ANALYTICS -------- */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4">Department Leave Analytics</h3>
          {analytics.length ? <Bar data={chartData} /> : <p>No data available</p>}
        </div>

        {/* -------- LOCK LEAVE PERIOD -------- */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <UilLock /> Lock Leave Period
          </h3>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <DatePicker
              selected={lock.startDate}
              onChange={date => setLock({ ...lock, startDate: date })}
              placeholderText="Start Date"
              className="px-4 py-2 border rounded-lg"
            />
            <DatePicker
              selected={lock.endDate}
              onChange={date => setLock({ ...lock, endDate: date })}
              minDate={lock.startDate || null}
              placeholderText="End Date"
              className="px-4 py-2 border rounded-lg"
            />
            <input
              placeholder="Reason"
              value={lock.reason}
              onChange={e => setLock({ ...lock, reason: e.target.value })}
              className="px-4 py-2 border rounded-lg flex-1"
            />
            <button
              onClick={lockLeaves}
              className="bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700"
            >
              Lock
            </button>
          </div>
        </div>

      </div>

      <Footer />
    </>
  );
}

/* ---------------- COMPONENTS ---------------- */

const TabButton = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition
      ${active ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
  >
    {icon}
    {label}
  </button>
);

const LeaveCard = ({ leave, takeAction, forwardToAdmin }) => (
  <div className="bg-white p-4 rounded-xl shadow">
    <h4 className="font-semibold">{leave.faculty.name}</h4>
    <p className="text-sm text-gray-500">{leave.faculty.subject}</p>
    <p><b>Type:</b> {leave.leaveType}</p>
    <p><b>Dates:</b> {leave.startDate.slice(0, 10)} → {leave.endDate.slice(0, 10)}</p>
    <p><b>Reason:</b> {leave.reason}</p>

    <div className="flex gap-3 mt-4">
      <button
        onClick={() => takeAction(leave._id, "APPROVED")}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Approve
      </button>
      <button
        onClick={() => takeAction(leave._id, "REJECTED")}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Reject
      </button>
      <button
        onClick={() => forwardToAdmin(leave._id)}
        className="bg-indigo-500 text-white px-4 py-2 rounded"
      >
        Forward
      </button>
    </div>
  </div>
);
