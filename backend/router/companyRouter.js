const express = require("express");
const router = express.Router();
const { Signup, createCompany, getCompanies, getCompanyById, updateCompany, deleteCompany, getMyProfile, editProfile, getMyJobs, getMyApplications, updateApplicationStatus, } = require("../controller/companyController");
const { signupLimiter } = require("../middleware/rateLimiter");
const { protect, authorizeRole } = require("../middleware/auth");

router.post("/signup", signupLimiter, Signup);

router.post("/create", protect, authorizeRole("admin"), createCompany);

router.get("/get", getCompanies);
router.get("/getsinglecompany/:id", getCompanyById);

router.put("/update/:id", protect, authorizeRole("admin"), updateCompany);
router.delete("/delete/:id", protect, authorizeRole("admin"), deleteCompany);

// Company Dashboard Routes
router.get("/my-profile", protect, authorizeRole("company"), getMyProfile);
router.put("/editProfile", protect, authorizeRole("company"), editProfile);
router.get("/my-jobs", protect, authorizeRole("company"), getMyJobs);
router.get( "/my-applications", protect, authorizeRole("company"), getMyApplications, );
router.put( "/applications/:id/status", protect, authorizeRole("company"), updateApplicationStatus );

module.exports = router;
