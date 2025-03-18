import express from "express";
import dotenv from "dotenv";
import passport from "../config/passportConfig.js";
import { insertUser, checkPassword } from "../controllers/authentication.js";

const router = express.Router();

//load API keys
dotenv.config();
const googleMapsAPI = process.env.googleMapsAPI;

router.get("/login", (req, res) => {
    res.render("login.ejs");
});

router.get("/register", (req, res) => {
    res.render("register.ejs");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      if (info.message === "Incorrect password!") {
        const data = {
          messagePassword : "Incorrect password!"
        };
        return res.render("login.ejs", data);
      } else if (info.message === "This email isn't registered!") {
        const data = {
          messageEmail : "Email is not registered!"
        };
        return res.render("login.ejs", data);
      }
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect("/");
    });
  })(req, res, next);
});

router.post("/loginNoSave", async (req, res) => {
  try {
    const email = req.body["email"].toLowerCase();
    const password = req.body["password"];

    const result = await checkPassword(email, password);

    if (result == 0) {
      res.render("login.ejs", { messageEmail: "This email isn't registered!" });
    } else if (result == 1) {
      const data = {
        googleMapsAPI : googleMapsAPI
      };
      res.render("homePageLoggedIn.ejs", data);
    } else {
      res.render("login.ejs", { messagePassword: "Incorrect password!" });
    }
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).send("Internal Server Error");
  }
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