import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import AdminNavbar from "../components/AdminNavbar";

import {
  UilFileAlt,
  UilClock,
  UilCheckCircle,
  UilTimesCircle,
  UilLock,
  UilCheck,
  UilTimes,
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

export default function DashboardAdmin() {
  const token = localStorage.getItem("token");

  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState({});
  const [locks, setLocks] = useState([]);
  const [lock, setLock] = useState({ startDate: "", endDate: "", reason: "" });

  useEffect(() => {
    fetchAllLeaves();
    fetchStats();
    fetchLocks();
  }, []);

  /* ---------------- FETCH ---------------- */

  const fetchAllLeaves = async () => {
    const res = await axios.get("http://localhost:5000/api/admin/leaves", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLeaves(res.data);
  };

  const fetchStats = async () => {
    const res = await axios.get("http://localhost:5000/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setStats(res.data);
  };

  const fetchLocks = async () => {
    const res = await axios.get("http://localhost:5000/api/locked/all", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLocks(res.data);
  };

  /* ---------------- ACTIONS ---------------- */

  const takeAction = async (id, status) => {
    const comment =
      status === "REJECTED" ? prompt("Rejection reason") : "";

    await axios.put(
      `http://localhost:5000/api/admin/leave/${id}`,
      { status, comment },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchAllLeaves();
    fetchStats();
  };

  /* ---------------- LOCK ---------------- */

  const createLock = async () => {
    await axios.post(
      "http://localhost:5000/api/locked/create",
      lock,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setLock({ startDate: "", endDate: "", reason: "" });
    fetchLocks();
  };

  /* ---------------- CHART ---------------- */

  const chartData = {
    labels: stats.byDepartment?.map((d) => d.department),
    datasets: [
      {
        label: "Leaves",
        data: stats.byDepartment?.map((d) => d.count),
        backgroundColor: "#14b8a6",
      },
    ],
  };

  /* ---------------- UI ---------------- */

  return (
    <>
      <AdminNavbar />

      <div style={styles.page}>
        <h1 style={styles.title}>Admin Command Center</h1>

        {/* -------- STATS -------- */}
        <div style={styles.stats}>
          <Stat icon={<UilFileAlt />} title="Total" value={stats.total} />
          <Stat icon={<UilClock />} title="Pending" value={stats.pending} />
          <Stat icon={<UilCheckCircle />} title="Approved" value={stats.approved} />
          <Stat icon={<UilTimesCircle />} title="Rejected" value={stats.rejected} />
        </div>

        {/* -------- ANALYTICS -------- */}
        <div style={styles.card}>
          <h3>📊 Department-wise Analytics</h3>
          {stats.byDepartment ? <Bar data={chartData} /> : <p>Loading...</p>}
        </div>

        {/* -------- LOCK MANAGEMENT -------- */}
        <div style={styles.card}>
          <h3><UilLock /> Global Leave Locks</h3>

          <div style={styles.lockRow}>
            <input
              type="date"
              value={lock.startDate}
              onChange={(e) => setLock({ ...lock, startDate: e.target.value })}
            />
            <input
              type="date"
              value={lock.endDate}
              onChange={(e) => setLock({ ...lock, endDate: e.target.value })}
            />
            <input
              placeholder="Reason"
              value={lock.reason}
              onChange={(e) => setLock({ ...lock, reason: e.target.value })}
            />
            <button style={styles.lockBtn} onClick={createLock}>
              Lock
            </button>
          </div>

          {locks.map((l) => (
            <p key={l._id}>
              {l.startDate.slice(0, 10)} → {l.endDate.slice(0, 10)} ({l.reason})
            </p>
          ))}
        </div>

        {/* -------- LEAVE REQUESTS -------- */}
        <h3 style={{ marginTop: 30 }}>📄 All Leave Requests</h3>

        {leaves.map((l) => (
          <div key={l._id} style={styles.leaveCard}>
            <h4>{l.faculty.name} ({l.faculty.subject})</h4>
            <p>{l.leaveType} | {l.startDate.slice(0,10)} → {l.endDate.slice(0,10)}</p>
            <p>Status: <b>{l.status}</b></p>

            <div style={styles.actions}>
              <button
                style={styles.approve}
                onClick={() => takeAction(l._id, "APPROVED")}
              >
                <UilCheck /> Approve
              </button>

              <button
                style={styles.reject}
                onClick={() => takeAction(l._id, "REJECTED")}
              >
                <UilTimes /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------------- STAT CARD ---------------- */

const Stat = ({ icon, title, value }) => (
  <div style={styles.statBox}>
    <div style={styles.statIcon}>{icon}</div>
    <p>{title}</p>
    <h2>{value ?? "-"}</h2>
  </div>
);

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    padding: "120px 30px 30px",
    background: "#f0fdfa",
    minHeight: "100vh",
  },
  title: {
    marginBottom: 25,
    color: "#0f766e",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 30,
  },
  statBox: {
    background: "#ffffff",
    padding: 20,
    borderRadius: 16,
    textAlign: "center",
    boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
  },
  statIcon: {
    fontSize: 28,
    color: "#14b8a6",
    marginBottom: 6,
  },
  card: {
    background: "#ffffff",
    padding: 25,
    borderRadius: 16,
    marginBottom: 25,
  },
  leaveCard: {
    background: "#ffffff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
  },
  actions: {
    display: "flex",
    gap: 12,
    marginTop: 10,
  },
  approve: {
    background: "#14b8a6",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  reject: {
    background: "#ef4444",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  lockRow: {
    display: "flex",
    gap: 10,
    marginTop: 12,
  },
  lockBtn: {
    background: "#0f766e",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: 8,
  },
};
