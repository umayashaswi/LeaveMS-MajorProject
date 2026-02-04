import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;
      localStorage.clear();
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Role-based redirect
      setTimeout(() => {
        if (user.role === "Faculty") navigate("/dashboard/faculty");
        else if (user.role === "HOD") navigate("/dashboard/hod");
        else if (user.role === "Admin") navigate("/dashboard/admin");
        else navigate("/"); 
      }, 0);

    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 px-4 py-24">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10">
          <h2 className="text-3xl font-extrabold text-teal-600 text-center mb-6">
            Login
          </h2>

          {error && (
            <p className="text-red-600 font-semibold mb-4 text-center">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="px-4 py-3 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="px-4 py-3 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            <button
              type="submit"
              className="bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
            >
              Login
            </button>
          </form>

          <div className="flex justify-between mt-6 text-sm text-teal-600 font-medium">
            <Link to="/" className="hover:underline">
              🏠 Home
            </Link>
            <Link to="/register" className="hover:underline">
              📝 Register
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default LoginPage;
