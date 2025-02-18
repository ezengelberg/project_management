import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import User from "../models/users.js";

passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      // console.log("🔍 Attempting authentication for email:", email);
      const user = await User.findOne({ email: email });
      if (!user) {
        console.log("❌ User not found");
        return done(null, false, { message: "אימייל או סיסמה לא נכונים." });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("❌ Password is incorrect");
        return done(null, false, { message: "אימייל או סיסמה לא נכונים." });
      }
      // console.log("✅ User authenticated successfully:", user.email);
      return done(null, user);
    } catch (err) {
      console.error("❌ Authentication error:", err);
      return done(err);
    }
  }),
);
export default passport;
