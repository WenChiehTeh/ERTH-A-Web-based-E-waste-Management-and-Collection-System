import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { insertUser } from "./controllers/authentication.js";
import { checkPassword } from "./controllers/authentication.js";
import dotenv from "dotenv"; 
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import bcrypt from "bcrypt";

//Server configuration
const app = express();
const port = 3000;

//load API keys
dotenv.config();
const googleMapsAPI = process.env.googleMapsAPI;
const databasePassword = process.env.databasePassowrd;

//Database configuration
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ERTH E-waste Management System',
  password: databasePassword,
  port: 5432,
});

export default pool;

//Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "SECRET",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new Strategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, cb) => {
      try {
        const getUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (getUser.rows.length === 0) {
          return cb(null, false, { message: "This email isn't registered!" });
        }

        const user = getUser.rows[0];
        const storedPassword = user.password;

        const isMatch = await bcrypt.compare(password, storedPassword);
        if (!isMatch) {
          return cb(null, false, { message: "Incorrect password!" });
        }

        return cb(null, user);
      } catch (error) {
        return cb(error);
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

//Server initialization
app.listen(port, () => {
  console.log("listening on port " + port + ".");
});

//Server routes
app.get("/", (req, res) => {
  console.log(req.user);
  if (req.isAuthenticated()) {
    const data = {
      googleMapsAPI : googleMapsAPI
    };
    res.render("homePageLoggedIn.ejs", data);
  } else {
    res.redirect("/homepage");
  }
})

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/loginFailedWrongPass", (req, res) => {
  res.render("login.ejs", { messagePassword: "Incorrect password!" });
});

app.get("/loginFailedNotExist", (req, res) => {
  res.render("login.ejs", { messageEmail: "Email does not exists!" });
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/homepage", (req, res) => {
  const data = {
    googleMapsAPI : googleMapsAPI
  };
  res.render("homePage.ejs", data);
})

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      if (info.message === "Incorrect password!") {
        return res.redirect("/loginFailedWrongPass");
      } else if (info.message === "This email isn't registered!") {
        return res.redirect("/loginFailedNotExist");
      }
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect("/");
    });
  })(req, res, next);
});

app.post("/loginNoSave", async (req, res) => {
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

app.post("/registerAccount", async (req, res) => {
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