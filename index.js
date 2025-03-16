import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { insertUser } from "./controllers/authentication.js";
import dotenv from "dotenv"; 

//Server configuration
const app = express();
const port = 3000;

//load API keys
dotenv.config();
const googleMapsAPI = process.env.googleMapsAPI;
const databasePassword = process.env.databasePassword;

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
app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

//Server initialization
app.listen(port, () => {
  console.log("listening on port " + port + ".");
});

//Server routes
app.get("/", (req, res) => {
  const data = {
    googleMapsAPI : googleMapsAPI
  };
  res.render("homePage.ejs", data);
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/login", async (req, res) => {
  //load data into memory
  const email = req.body["email"];
  const password = req.body["password"];

  //query for existing user
  const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

  //check for existing user, then check for matching credentials
  if (existingUser.rows.length == 0) {
    const data = {
      messageEmail : "This email isnt registered!"
    };
    res.render("login.ejs", data);
  }
});

app.post("/registerAccount", async (req, res) => {
  //load data into memory
  const email = req.body["email"];
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
      res.render("homePage.ejs");
  }
});