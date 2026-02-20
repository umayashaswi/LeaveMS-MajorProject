const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

exports.register = async (req, res) => {
  try {
    const {
  name,
  email,
  password,
  subject,
  dob,
  joiningDate,
  maritalStatus,
  role,
  gender,
} = req.body;


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      subject,
      dob,
      joiningDate,
      maritalStatus,
      role,
      gender,
      emailOtp: otp,
      otpExpiry: Date.now() + 10 * 60 * 1000, // 10 mins
      isVerified: false,
    });

    await sendEmail(
      email,
      "Verify your Email - LeaveMS",
      `<h2>Email Verification</h2>
       <p>Your OTP is:</p>
       <h1>${otp}</h1>
       <p>This OTP is valid for 10 minutes.</p>`
    );

    res.status(201).json({
      message: "Registration successful. OTP sent to email.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    console.log("VERIFY OTP BODY:", req.body); // 👈 IMPORTANT

    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.json({ message: "Email already verified" });
    }

    if (user.emailOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.emailOtp = null;
    user.otpExpiry = null;
    await user.save();

    return res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 2️⃣ Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3️⃣ Check if email verified
    if (!user.isVerified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    // 4️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // 5️⃣ Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email,
        role:user.role, 
        gender:user.gender,
        maritalStatus: user.maritalStatus
    },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 6️⃣ Return success
    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        maritalStatus: user.maritalStatus,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};