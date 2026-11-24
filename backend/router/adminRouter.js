const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getAllCompanies,
  getAllJobs,
  deleteUser,
  updateCompany,
  deleteCompany,
  deleteJob,
  getAllApplications,
  updateApplicationStatus ,
} = require("../controller/adminController");
const { protect, authorizeRole } = require("../middleware/auth");

router.get("/stats", protect, authorizeRole("admin"), getDashboardStats);

router.get("/users", protect, authorizeRole("admin"), getAllUsers);

router.get("/companies", protect, authorizeRole("admin"), getAllCompanies);

router.get("/jobs", protect, authorizeRole("admin"), getAllJobs);

router.get("/applications", protect, authorizeRole("admin"), getAllApplications, );

router.delete("/users/:id", protect, authorizeRole("admin"), deleteUser);

router.put("/companies/:id", protect, authorizeRole("admin"), updateCompany);

router.put( "/applications/:id", protect, authorizeRole("admin"), updateApplicationStatus );

router.delete("/companies/:id", protect, authorizeRole("admin"), deleteCompany);

router.delete("/jobs/:id", protect, authorizeRole("admin"), deleteJob);

module.exports = router;
