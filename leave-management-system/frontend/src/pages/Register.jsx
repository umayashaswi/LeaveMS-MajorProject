import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import enGB from "date-fns/locale/en-GB";

registerLocale("en-GB", enGB);
setDefaultLocale("en-GB");

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    gender: "",
    joiningDate: null,
    dob: null,
    subject: "",
    maritalStatus: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (
      formData.joiningDate &&
      formData.dob &&
      formData.joiningDate < formData.dob
    ) {
      setMessage("Joining date cannot be before Date of Birth");
      return;
    }

    try {
      const payload = {
        ...formData,
        dob: formData.dob
          ? formData.dob.toISOString().split("T")[0]
          : "",
        joiningDate: formData.joiningDate
          ? formData.joiningDate.toISOString().split("T")[0]
          : "",
      };

      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        payload
      );
      setOtpSent(true);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email: formData.email,
        otp,
      });

      alert("Email verified! Redirecting to login...");
      navigate("/login");
    } catch (err) {
      setMessage(err.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex justify-center items-center bg-slate-50 px-4 py-24">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10">
          <h2 className="text-3xl font-extrabold text-teal-600 text-center mb-6">
            LeaveMS Registration
          </h2>

          {message && (
            <p className="text-teal-600 font-semibold mb-4 text-center">
              {message}
            </p>
          )}

          {!otpSent ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                required
                className="input"
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                required
                className="input"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
                className="input"
              />

              <select
                name="role"
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Select Role</option>
                <option value="Faculty">Faculty</option>
                <option value="HOD">HOD</option>
                <option value="Admin">Admin</option>
              </select>

              <select
                name="gender"
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              {/* DOB */}
              <label className="font-medium">Date of Birth</label>
              <DatePicker
                selected={formData.dob}
                onChange={(date) =>
                  setFormData({ ...formData, dob: date })
                }
                dateFormat="yyyy-MM-dd"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                yearDropdownItemNumber={100}
                maxDate={new Date()}
                className="input"
              />

              {/* Joining Date */}
              <label className="font-medium">Joining Date</label>
              <DatePicker
                selected={formData.joiningDate}
                onChange={(date) =>
                  setFormData({ ...formData, joiningDate: date })
                }
                dateFormat="yyyy-MM-dd"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                yearDropdownItemNumber={50}
                minDate={formData.dob || null}
                maxDate={new Date()}
                className="input"
              />

              <input
                name="subject"
                placeholder="Subject Teaching"
                onChange={handleChange}
                required
                className="input"
              />

              <select
                name="maritalStatus"
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Marital Status</option>
                <option>Single</option>
                <option>Married</option>
              </select>

              <button className="bg-teal-600 text-white py-3 rounded-lg font-semibold">
                Register
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
              <input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="input"
              />
              <button className="bg-teal-600 text-white py-3 rounded-lg font-semibold">
                Verify OTP
              </button>
            </form>
          )}

          <div className="flex justify-between mt-6 text-sm text-teal-600">
            <Link to="/">← Home</Link>
            <Link to="/login">Already registered? Login</Link>
          </div>
        </div>
      </div>

      <Footer />

      <style>
        {`
          .input {
            padding: 12px;
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

export default Register;
