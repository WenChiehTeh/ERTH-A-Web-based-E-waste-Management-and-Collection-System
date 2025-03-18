import express from "express";
import dotenv from "dotenv"; 

const router = express.Router();

//load API keys
dotenv.config();
const googleMapsAPI = process.env.googleMapsAPI;

router.get("/", (req, res) => {
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

router.get("/homepage", (req, res) => {
    const data = {
      googleMapsAPI : googleMapsAPI
    };
    res.render("homePage.ejs", data);
})

export default router;