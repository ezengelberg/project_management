import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local"; // Import Strategy as LocalStrategy for usernameField and passwordField
import bcrypt from "bcrypt";
import User from "../models/users.js";

passport.use(
  new LocalStrategy(
    { usernameField: "email" }, // Specify that we're using 'email' instead of 'username'
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email });
        if (!user) {
          return done(null, false, { message: "Incorrect email or password." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect email or password." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, user._id); // Store user id in session
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
