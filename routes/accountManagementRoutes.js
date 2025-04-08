import express from "express";
import dotenv from "dotenv"; 
import pool from "../config/database.js";
import bcrypt from "bcrypt";

const router = express.Router();

const saltRounds = 10;

router.post("/addAccount", async (req, res) => {
    //load data into memory
    const username = req.body["username"].toLowerCase();
    const password = req.body["password"];
    const name = req.body["name"].toUpperCase();
    const role = req.body["role"];

    try {
        const existingUser = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);

        if (existingUser.rows.length >= 1) {
            console.log(existingUser.rows)
            const data = {
                username: req.user.username,
                role: req.user.role,
                message: "Account is already registered!"
            };
            res.render("adminAddAccount.ejs", data);
        } else {
            if (role == "driver") {
                const vehicleType = req.body["vehicle"];
                const numberPlate = req.body["numberPlate"];
                bcrypt.hash(password, saltRounds, async (err, hash) => {
                    if (err) {
                      console.log("Error hashing password:" , err)
                    } else {
                      const result = await pool.query('INSERT INTO admins (name, username, password, role) VALUES ($1, $2, $3, $4) RETURNING id', [name, username, hash, role]);

                      const id = result.rows[0].id; 

                      const insertDriverDetails = await pool.query("INSERT INTO driver (vehicleType, numberPlate, driverID) VALUES ($1, $2, $3)", [vehicleType, numberPlate, id]);

                      res.render("responses/accountAddSuccess.ejs");
                    }
              });
            } else {
                bcrypt.hash(password, saltRounds, async (err, hash) => {
                      if (err) {
                        console.log("Error hashing password:" , err)
                      } else {
                        const result = await pool.query('INSERT INTO admins (name, username, password, role) VALUES ($1, $2, $3, $4)', [name, username, hash, role]);
                        res.render("responses/accountAddSuccess.ejs");
                      }
                });
            }
        }
    } catch (e) {
        console.log("An error Occured: " + e);
    }




})

export default router;