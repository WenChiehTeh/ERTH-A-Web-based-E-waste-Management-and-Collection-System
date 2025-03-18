import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import pool from "./database.js";

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const getUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (getUser.rows.length === 0) {
          return done(null, false, { message: "This email isn't registered!" });
        }

        const user = getUser.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password!" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const getUser = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, getUser.rows[0]);
  } catch (error) {
    done(error);
  }
});

export default passport;