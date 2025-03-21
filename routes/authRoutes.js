import express from "express";
import dotenv from "dotenv";
import passport from "../config/passportConfig.js";
import { insertUser } from "../controllers/authentication.js";

const router = express.Router();

//load API keys
dotenv.config();
const googleMapsAPI = process.env.googleMapsAPI;

//go to login page
router.get("/login", (req, res) => {
    res.render("login.ejs");
});

//go to register page
router.get("/register", (req, res) => {
    res.render("register.ejs");
});

//go to google OAuth page
router.get("/auth/google", passport.authenticate("google", {
  scope: ['profile', 'email'],
}))

//Result from OAuth page
router.get("/auth/google/secrets", passport.authenticate("google", {
  successRedirect: "/",
  failureRedirect: "/login",
}))

//login function
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err){
      return next(err);
    }

    if (!user) {
      const data = {};
      if (info.message === "Incorrect password!") {
        data.messagePassword = "Incorrect password!";
      } else if (info.message === "This email isn't registered!") {
        data.messageEmail = "Email is not registered!";
      }
      return res.render("login.ejs", data);
    } 

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }

      if (req.body["rememberMe"] == "true") {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
      } else {
        req.session.cookie.expires = false;
      }

      return res.redirect("/");
    });
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).send("Error logging out");
      }
      res.clearCookie("connect.sid"); // Clear session cookie
      res.redirect("/login"); // Redirect to login page
    });
  });
});

router.post("/registerAccount", async (req, res) => {
    //load data into memory
    const email = req.body["email"].toLowerCase();
    const password = req.body["password"];
    const retypePassword = req.body["retypePassword"];
  
    //query for existing user
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  
    //check for existing user and missmatch password, then register
    if (existingUser.rows.length > 0) {
      const data = {
        messageEmail : "Email already registered!"
      };
      res.render("register.ejs", data);
    } else if (password != retypePassword) {
      const data = {
        messagePassword : "Password missmatch!"
      };
      res.render("register.ejs", data);
    } else {
        insertUser(email, password);
        res.redirect("/login");
    }
});

export default router;