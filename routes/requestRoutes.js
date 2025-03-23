import express from "express";
import dotenv from "dotenv"; 

const router = express.Router();

//load API keys
dotenv.config();
const googleMapsAPI = process.env.googleMapsAPI;

router.get("/makeCollectionRequest", (req, res) => {
    const data = {
        points: req.user.points,
    };
    res.render("makeCollectionRequest.ejs", data);
});

router.post("/submitCollection", (req,res) => {
    console.log(req.body["item"]);
    console.log(req.user);
})
export default router;