import express from "express";
import dotenv from "dotenv"; 
import bcrypt from "bcrypt";

const router = express.Router();

//load API keys
dotenv.config();
const googleMapsAPI = process.env.googleMapsAPI;

router.get("/", (req, res) => {
    console.log(req.user);
    if (req.isAuthenticated()) {
      const data = {
        googleMapsAPI : googleMapsAPI,
        points: req.user.points,
      };
      res.render("homePageLoggedIn.ejs", data);
    } else {
      res.redirect("/homepage");
    }
})

router.get("/blog", (req, res) => {
  res.render("blogsMain.ejs");
})

router.get("/blog1", (req, res) => {
  res.render("blogs/blog1.ejs");
})

router.get("/blog2", (req, res) => {
  res.render("blogs/blog2.ejs");
})

router.get("/blog3", (req, res) => {
  res.render("blogs/blog3.ejs");
})

router.get("/calculateEwaste", (req, res) => {
  res.render("calculateEwaste.ejs");
})

router.get("/howItWorks", (req, res) => {
  res.render("howItWorks.ejs");
})

router.get("/aboutUs", (req, res) => {
    res.render("aboutUs.ejs");
})

router.get("/homepage", async (req, res) => {
    const data = {
      googleMapsAPI : googleMapsAPI
    };
    res.render("homepage.ejs", data);
})

export default router;