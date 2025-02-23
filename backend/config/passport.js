import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import User from "../models/users.js";

passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
        try {
            const user = await User.findOne({ email: email });
            if (!user) {
                return done(null, false, { message: "אימייל או סיסמה לא נכונים." });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: "אימייל או סיסמה לא נכונים." });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }),
);
export default passport;
