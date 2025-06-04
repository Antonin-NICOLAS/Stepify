const express = require("express");
const cors = require("cors");
require("dotenv").config();
//middleware
const { verifyToken, requireAuth } = require("../middlewares/VerifyToken.js");
const { localization } = require("../middlewares/Localization");
const authLimiter = require("../middlewares/AuthLimiter");
//controllers
const {
  createUser,
  verifyEmail,
  resendVerificationEmail,
  ChangeVerificationEmail,
  deleteUser,
  loginUser,
  forgotPassword,
  resetPassword,
  logoutUser,
  checkAuth,
} = require("../controllers/AuthController");

//router
const router = express.Router();

//middleware
router.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_SERVER,
  }),
  localization
);

//routes
router.post("/register", createUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification-code", resendVerificationEmail);

router.post("/login", authLimiter, loginUser);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.use(verifyToken, localization, requireAuth);

router.post("/change-verification-email", ChangeVerificationEmail);
router.get("/check-auth", checkAuth);
router.post("/logout", logoutUser);
router.delete("/:userId/delete", deleteUser);

module.exports = router;
