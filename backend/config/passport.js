import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local"; // Import Strategy as LocalStrategy for usernameField and passwordField
import bcrypt from "bcryptjs";
import User from "../models/users.js";

passport.use(
  new LocalStrategy(
    { usernameField: "email" }, // Specify that we're using 'email' instead of 'username'
    async (email, password, done) => {
      try {
        console.log("searching for user with email:", email);
        const user = await User.findOne({ email: email });
        if (!user) {
          return done(null, false, { message: "אימייל או סיסמה לא נכונים." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          console.log("Password is incorrect");
          return done(null, false, { message: "אימייל או סיסמה לא נכונים." });
        }
        console.log("User found:", user);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

// Serialize user to store in session
passport.serializeUser((user, done) => {
  console.log("Serializing user:", user._id.toString());
  done(null, user.toString());
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  console.log("Deserializing user with id:", id);
  try {
    const user = await User.findById(id);
    console.log("User deserialized:", user);
    done(null, user);
  } catch (err) {
    console.error("Error during deserialization:", err);
    done(err);
  }
});

export default passport;
