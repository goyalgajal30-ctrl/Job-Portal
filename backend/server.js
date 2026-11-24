const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config()
// dotenv.config()

const userRouter = require("./router/userRouter");
const companyRouter = require("./router/companyRouter");
const jobRouter = require("./router/jobRouter");
const userProfileRouter = require("./router/userProfileRouter");
const companyProfileRouter = require("./router/companyProfileRouter");
const jobApplyRouter = require("./router/jobApplyRouter");
const adminRouter = require("./router/adminRouter");
const authRouter = require("./router/authRouter");
const interviewRouter = require("./router/interviewRouter");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    req.body = {};
  }
  next();
});
app.use(cors());


app.use("/api/user", userRouter);
app.use("/api/company", companyRouter);
app.use("/api/job", jobRouter);
app.use("/api/job-apply", jobApplyRouter);
app.use("/api/user-profile", userProfileRouter);
app.use("/api/company-profile", companyProfileRouter);
app.use("/api/admin", adminRouter);
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);


app.get("/", (req, res) => {
  res.send("Job Portal Backend is running")
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "API route not found", });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.log("Server Error:", err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Database Connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URL || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MongoDB connection string (MONGO_URL or MONGO_URI) is missing");
    }
    await mongoose.connect(mongoUri);

    console.log("MongoDB connected successfully");

    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => {
      console.log(`JobNest server running on port ${PORT}`);
    });
  } catch (error) {
    console.log("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

connectDB();
