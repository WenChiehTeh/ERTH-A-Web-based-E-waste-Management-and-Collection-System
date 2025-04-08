import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "./config/passportConfig.js";
import indexRoutes from "./routes/indexRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import viewRequests from "./routes/viewRequests.js";
import adminRoutes from "./routes/adminRoutes.js";
import accountManagementRoutes from "./routes/accountManagementRoutes.js";
import { deleteOldPendingPayments } from "./controllers/paymentHandling.js"

//Server configuration
const app = express();
const port = 3000;

//Middleware
app.use(express.json())
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "SECRET",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: null,
      expires: false,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

//Delete outstanding payments that have been created more than 24 hours ago
deleteOldPendingPayments()

//Check for pending payments that are created 24 hours ago every hour
setInterval(deleteOldPendingPayments, 60 * 60 * 1000);

//Server initialization
app.listen(port, () => {
  console.log("listening on port " + port + ".");
});

//Server routes
app.use(indexRoutes);
app.use(authRoutes);
app.use(requestRoutes);
app.use(viewRequests);
app.use(adminRoutes);
app.use(accountManagementRoutes);