const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controller/auth");

router.post("/register", authController.register);
router.get("/verify-email", authController.verifyEmail);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

// Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_ORIGIN}/login?error=google_fail`,
  }),
  authController.googleCallback
);

router.put("/set-password", authController.setPassword);

module.exports = router;
