import express from "express";
import dotenv from "dotenv"; 
import pool from "../config/database.js";

const router = express.Router();

router.get("/adminDashboard", (req, res) => {
    console.log(req.user);
    if (req.isAuthenticated()) {
        const data = {
            name: req.user.name,
            username: req.user.username,
        };
        res.render("adminDashboard.ejs", data);
    } else {
      res.redirect("/adminLogin");
    }
})

router.get("/adminAddAccounts", (req, res) => {
    console.log(req.user);
    if (req.isAuthenticated()) {
        const data = {
            username: req.user.username,
            role: req.user.role,
        };
        res.render("adminAddAccount.ejs", data);
    } else {
      res.redirect("/adminLogin");
    }
})

export default router;