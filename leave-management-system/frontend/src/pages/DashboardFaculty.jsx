import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import FacultyNavbar from "../components/FacultyNavbar";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

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

  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    substituteFaculty: "",
  });

  const [leaves, setLeaves] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    if (!user || user.role !== "Faculty") {
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate, user]);

  /* ---------------- FETCH LEAVES ---------------- */
  const fetchMyLeaves = async () => {
    const res = await axios.get("http://localhost:5000/api/leave/my", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLeaves(res.data);
  };

  useEffect(() => {
    fetchMyLeaves();
    const interval = setInterval(fetchMyLeaves, 15000);
    return () => clearInterval(interval);
  }, []);

  /* ---------------- APPLY LEAVE ---------------- */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await axios.post("http://localhost:5000/api/leave/apply", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("✅ Leave request submitted");
      setForm({
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
        substituteFaculty: "",
      });

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

  /* ---------------- ANALYTICS ---------------- */
  const monthlyCounts = Array(12).fill(0);

  leaves.forEach((l) => {
    const date = new Date(l.startDate);
    if (date.getFullYear() === currentYear) {
      monthlyCounts[date.getMonth()]++;
    }
  });

  const chartData = {
    labels: [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ],
    datasets: [
      {
        label: `Leaves Applied (${currentYear})`,
        data: monthlyCounts,
        backgroundColor: "#0f766e",
      },
    ],
  };

  /* ---------------- PDF ---------------- */
  const downloadPDF = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const doc = new jsPDF();
    doc.text(`Leave Report - ${user.name} (${currentYear})`, 14, 15);
    doc.text(`Generated on: ${currentDate}`, 14, 22);

    const tableData = leaves
      .filter(
        (l) => new Date(l.startDate).getFullYear() === currentYear
      )
      .map((l) => [
        l.leaveType,
        l.startDate.slice(0, 10),
        l.endDate.slice(0, 10),
        l.status,
        l.rejectionReason || "-",
      ]);

    autoTable(doc, {
      head: [["Type", "Start", "End", "Status", "Remarks"]],
      body: tableData,
      startY: 30,
    });

    doc.save(`leave-report-${currentYear}.pdf`);
  };

  return (
    <>
      <FacultyNavbar />

      <div className="pt-28 px-8 bg-gradient-to-br from-teal-50 to-white min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-teal-700">
              Faculty Dashboard
            </h2>
            <p className="text-sm text-gray-500">
              {currentDay}, {currentDate}
            </p>
          </div>

          <div className="bg-teal-100 text-teal-800 px-4 py-2 rounded-lg font-semibold">
            Leave Year: {currentYear}
          </div>
        </div>

        {/* LEAVE BALANCES */}
        <div className="grid grid-cols-4 gap-4 mb-8">
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
            .map((type) => (
              <div key={type} className="bg-white rounded-xl shadow p-4">
                <p className="font-semibold">{type}</p>
                <p className="text-sm text-gray-500">
                  Used: {usedLeaves[type] || 0} / {LEAVE_LIMITS[type]} days
                </p>
              </div>
            ))}
        </div>

        {/* APPLY LEAVE */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="font-semibold mb-4">Apply Leave</h3>

          {message && <p className="text-green-600">{message}</p>}
          {error && <p className="text-red-600">{error}</p>}

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

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
                .map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
            </select>

            <input
              name="substituteFaculty"
              placeholder="Substitute Faculty"
              value={form.substituteFaculty}
              onChange={handleChange}
              required
              className="input"
            />

            <input
              type="date"
              name="startDate"
              min={`${currentYear}-01-01`}
              max={`${currentYear}-12-31`}
              value={form.startDate}
              onChange={handleChange}
              required
              className="input"
            />

            <input
              type="date"
              name="endDate"
              min={`${currentYear}-01-01`}
              max={`${currentYear}-12-31`}
              value={form.endDate}
              onChange={handleChange}
              required
              className="input"
            />

            <textarea
              name="reason"
              placeholder="Reason"
              value={form.reason}
              onChange={handleChange}
              className="input col-span-2"
            />

            <button className="col-span-2 bg-teal-600 text-white py-2 rounded-lg font-semibold">
              Apply Leave
            </button>
          </form>
        </div>

        {/* MY LEAVES */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="font-semibold mb-4">
            My Leave Requests ({currentYear})
          </h3>

          <table className="w-full text-sm">
            <thead className="bg-teal-50">
              <tr>
                <th className="p-2">Type</th>
                <th className="p-2">Dates</th>
                <th className="p-2">Status</th>
                <th className="p-2">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {leaves
                .filter(
                  (l) =>
                    new Date(l.startDate).getFullYear() === currentYear
                )
                .map((l) => (
                  <tr key={l._id} className="border-b">
                    <td className="p-2">{l.leaveType}</td>
                    <td className="p-2">
                      {l.startDate.slice(0, 10)} →{" "}
                      {l.endDate.slice(0, 10)}
                    </td>
                    <td className="p-2 font-bold">{l.status}</td>
                    <td className="p-2">
                      {l.rejectionReason || "-"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <button
            type="button"
            onClick={downloadPDF}
            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg"
          >
            Download PDF
          </button>
        </div>

        {/* ANALYTICS */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold mb-4">
            Monthly Leave Analytics ({currentYear})
          </h3>
          <Bar data={chartData} />
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
