const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
require("dotenv").config();

// Chỉ khởi tạo Google Strategy nếu có đủ thông tin cần thiết
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            if (user.avatar_url !== profile.photos[0].value) {
              user.avatar_url = profile.photos[0].value;
              await user.save();
            }
            return done(null, user);
          } else {
            const newUser = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              is_verified: true,
              role: "renter",
              avatar_url: profile.photos[0].value,
            });
            return done(null, newUser);
          }
        } catch (error) {
          console.error("Error in Google Auth callback:", error);
          return done(error);
        }
      }
    )
  );
} else {
  console.log(
    "Google OAuth2 credentials not found. Google login will be disabled."
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
