import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2"
import bcrypt from "bcrypt";
import pool from "./database.js";
import dotenv from "dotenv";

dotenv.config();
const googleClientID = process.env.googleClientID;
const googleClientSecret = process.env.googleClientSecret;

passport.use("local",
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

passport.use(
  "google", 
  new GoogleStrategy( 
    {
      clientID: googleClientID,
      clientSecret: googleClientSecret,
      callbackURL: "http://localhost:3000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    }, 
    async (accessToken, refreshToken, profile, cb) =>  {
      console.log(profile);
      try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [profile.email]);
        if (result.rows.length == 0) {
          const newUser = await pool.query("INSERT INTO users (email,password) VALUES ($1, $2)", [profile.email, "google"]);
          cb(null, newUser.rows[0]);
        } else {
          cb(null, result.rows[0]);
        }
      } catch (err) {
        cb(err);
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