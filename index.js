import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "./config/passportConfig.js";
import indexRoutes from "./routes/indexRoutes.js";
import authRoutes from "./routes/authRoutes.js";

//Server configuration
const app = express();
const port = 3000;

//Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "SECRET",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

//Server initialization
app.listen(port, () => {
  console.log("listening on port " + port + ".");
});

//Server routes
app.use(indexRoutes);
app.use(authRoutes);