const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ optional, if form-encoded

// Debug middleware
app.use((req, res, next) => {
  console.log("Incoming Request Body:", req.body);
  next();
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/leave", require("./routes/leaveRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/faculty", require("./routes/facultyRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));