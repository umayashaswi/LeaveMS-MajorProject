import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Home,
  LogIn,
  AlertCircle,
  BookOpen,
  Calendar,
  Heart,
  Users,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

<Navbar />

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    gender: "",
    department: "",
    joiningDate: "",
    dob: "",
    subject: "",
    maritalStatus: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSelect = (name, value) =>
    setFormData({ ...formData, [name]: value });

  // Input helpers
  const inputRow = (icon, label, name, type = "text", placeholder = "") => (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-gray-800 font-medium">{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        <Input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={formData[name]}
          onChange={handleChange}
          required
          className="pl-10 h-11 rounded-xl shadow-inner hover:shadow-lg transition-shadow duration-300"
        />
      </div>
    </div>
  );

  const selectRow = (icon, label, name, options) => (
    <div className="space-y-2">
      <Label className="text-gray-800 font-medium">{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none">{icon}</span>
        <Select
          value={formData[name]}
          onValueChange={(v) => handleSelect(name, v)}
          required
        >
          <SelectTrigger className="pl-10 h-11 rounded-xl shadow-inner hover:shadow-lg transition-shadow duration-300">
            <SelectValue placeholder={`Select ${label}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    // DOB & Joining validation
    if (formData.joiningDate && formData.dob && formData.joiningDate < formData.dob) {
      setMessage("Joining date cannot be before Date of Birth");
      setIsError(true);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        dob: formData.dob ? new Date(formData.dob).toISOString() : "",
        joiningDate: formData.joiningDate ? new Date(formData.joiningDate).toISOString() : "",
      };
      const res = await axios.post("http://localhost:5000/api/auth/register", payload);
      setOtpSent(true);
      setMessage(res.data.message);
    } catch (err) {
      console.log(err.response);
      setMessage(err.response?.data?.message || "Registration failed");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email: formData.email,
        otp,
      });
      alert("Email verified! Redirecting to login...");
      navigate("/login");
    } catch (err) {
      setMessage(err.response?.data?.message || "OTP verification failed");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-teal-50">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-12 relative">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-teal-300/40 blur-3xl animate-blob" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-teal-200/40 blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-teal-100/30 blur-3xl animate-blob animation-delay-4000" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-lg relative z-10"
        >
          <div className="glass-card rounded-2xl shadow-xl p-8 sm:p-10 space-y-6 backdrop-blur-md bg-white/60 border border-white/30">
            {/* Header */}
            <div className="text-center space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg mb-4"
              >
                <UserPlus className="w-7 h-7 text-white" />
              </motion.div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
                Create Account
              </h1>
              <p className="text-sm text-gray-600">
                Register for your leave management account
              </p>
            </div>

            {/* Message */}
            {message && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                <Alert
                  variant={isError ? "destructive" : "default"}
                  className={`rounded-xl ${isError ? "border-red-300 bg-red-50" : "border-teal-300 bg-teal-50"}`}
                >
                  {isError ? <AlertCircle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Registration Form */}
            {!otpSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {inputRow(<User className="w-4 h-4" />, "Full Name", "name", "text", "John Doe")}
                {inputRow(<Mail className="w-4 h-4" />, "Email Address", "email", "email", "you@example.com")}
                {inputRow(<Lock className="w-4 h-4" />, "Password", "password", "password", "••••••••")}

                <div className="grid grid-cols-2 gap-4">
                  {selectRow(<Users className="w-4 h-4" />, "Role", "role", [
                    { value: "Faculty", label: "Faculty" },
                    { value: "HOD", label: "HOD" },
                    { value: "Admin", label: "Admin" },
                  ])}
                  {selectRow(<User className="w-4 h-4" />, "Gender", "gender", [
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Other", label: "Other" },
                  ])}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dob" className="text-gray-800 font-medium">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="dob"
                        name="dob"
                        type="date"
                        value={formData.dob}
                        onChange={handleChange}
                        max={new Date().toISOString().split("T")[0]}
                        required
                        className="pl-10 h-11 rounded-xl shadow-inner hover:shadow-lg transition-shadow duration-300"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joiningDate" className="text-gray-800 font-medium">Joining Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="joiningDate"
                        name="joiningDate"
                        type="date"
                        value={formData.joiningDate}
                        onChange={handleChange}
                        min={formData.dob || undefined}
                        max={new Date().toISOString().split("T")[0]}
                        required
                        className="pl-10 h-11 rounded-xl shadow-inner hover:shadow-lg transition-shadow duration-300"
                      />
                    </div>
                  </div>
                </div>

                {inputRow(
  <BookOpen className="w-4 h-4" />,
  "Subject Teaching",
  "subject",
  "text",
  "e.g., Computer Science"
)}

                {selectRow(<Users className="w-4 h-4" />, "Department", "department", [
                  { value: "CSE", label: "CSE" },
                  { value: "AI", label: "AI" },
                  { value: "IT", label: "IT" },
                ])}

                {selectRow(<Heart className="w-4 h-4" />, "Marital Status", "maritalStatus", [
                  { value: "Single", label: "Single" },
                  { value: "Married", label: "Married" },
                ])}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-teal-400 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center"
                >
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" /> Register
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleOtpSubmit}
                className="space-y-6"
              >
                <div className="space-y-3 text-center">
                  <Label className="text-gray-800 font-medium">Enter Verification Code</Label>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-xs text-gray-500">We sent a 6-digit code to {formData.email}</p>
                </div>
                <Button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full h-11 bg-gradient-to-r from-teal-400 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center"
                >
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-2" /> Verify OTP
                    </>
                  )}
                </Button>
              </motion.form>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <Link to="/" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors">
                <Home className="w-4 h-4" /> Home
              </Link>
              <Link to="/login" className="flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors">
                <LogIn className="w-4 h-4" /> Already registered? Login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}