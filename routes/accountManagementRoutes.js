import express from "express";
import dotenv from "dotenv"; 
import pool from "../config/database.js";
import bcrypt from "bcrypt";

const router = express.Router();

const saltRounds = 10;

router.post("/addAccount", async (req, res) => {
    //load data into memory
    const username = req.body["username"].toUpperCase();
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
            if (role == "Driver") {
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
});

router.get('/api/loadAdminAccounts', async (req, res) => {
  try {
    const admins = await pool.query("SELECT id, name, username, role FROM admins");

    res.json(admins.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

router.delete('/accounts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM admins WHERE id = $1", [id]);

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;