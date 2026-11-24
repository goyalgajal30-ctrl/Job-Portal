const express = require("express");
const router = express.Router();
const { userSignup, userLogin, resetPassword, forgetPw, verifyOtp, getallusers, createAdmin, changePassword } = require("../controller/userController");
const { protect, authorizeRole } = require("../middleware/auth");
const { signupLimiter, loginLimiter, forgotPasswordLimiter, resetPasswordLimiter, verifyOtpLimiter } = require("../middleware/rateLimiter");

router.post("/signup", signupLimiter, userSignup);
router.post("/login", loginLimiter, userLogin);

router.post("/forget", forgotPasswordLimiter, forgetPw);
router.post("/verify-otp", verifyOtpLimiter, verifyOtp);
router.post("/reset", resetPasswordLimiter, resetPassword);

router.get("/getusers", protect, authorizeRole("admin"), getallusers);

router.get("/me", protect, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    }); 
});

router.post("/create-admin", createAdmin);
router.put("/change-password", protect, changePassword);

module.exports = router;
