import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import User from "../models/users.js";

passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      console.log("🔍 Attempting authentication for email:", email);
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
      console.log("✅ User authenticated successfully:", user.email);
      return done(null, user);
    } catch (err) {
      console.error("❌ Authentication error:", err);
      return done(err);
    }
  }),
);

// passport.serializeUser((user, done) => {
//   try {
//     console.log("🔵 Serializing user:", {
//       id: user._id.toString(),
//       email: user.email,
//       sessionID: user._id.toString(),
//     });

//     // Store the string version of the ID
//     const userId = user._id.toString();
//     console.log("📝 Stored user ID in session:", userId);
//     done(null, userId);
//   } catch (error) {
//     console.error("❌ Serialization error:", error);
//     done(error);
//   }
// });

passport.serializeUser((user, done) => {
  process.nextTick(() => {
    try {
      console.log("🔵 Serializing user:", {
        id: user._id.toString(),
        email: user.email,
      });

      // Store the user ID or minimal session data
      done(null, user._id.toString()); // Store only the ID here, or you can store a minimal session object if needed
    } catch (error) {
      console.error("❌ Serialization error:", error);
      done(error);
    }
  });
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log("🔵 Deserializing user with ID:", id);
    const user = await User.findById(id).select("-password"); // Only fetch necessary user info
    done(null, user);
  } catch (error) {
    console.error("❌ Deserialization error:", error);
    done(error);
  }
});

// passport.deserializeUser(async (id, done) => {
//   console.log("Deserializing attempt for id:", id);
//   try {
//     if (!id) {
//       console.error("No ID provided for deserialization");
//       return done(null, false);
//     }

//     const user = await User.findById(id).select("-password");
//     if (!user) {
//       console.error("No user found for id:", id);
//       return done(null, false);
//     }

//     console.log("Successfully deserialized user:", user.email);
//     return done(null, user);
//   } catch (err) {
//     console.error("Deserialization error:", err);
//     return done(err);
//   }
// });

// Add a middleware to check passport's state
const checkPassportState = (req, res, next) => {
  console.log("🔍 Passport State Check:", {
    sessionID: req.sessionID,
    hasSession: !!req.session,
    sessionPassport: req.session?.passport,
    isAuthenticated: req.isAuthenticated(),
    user: req.user ? { id: req.user._id, email: req.user.email } : "none",
  });
  next();
};

export { checkPassportState };
export default passport;
