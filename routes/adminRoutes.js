import express from "express"; 
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
});

router.get("/adminAddAccounts", (req, res) => {
    console.log(req.user);
    if (req.isAuthenticated()) {
        const data = {
            name: req.user.name,
            username: req.user.username,
        };
        res.render("adminAddAccount.ejs", data);
    } else {
      res.redirect("/adminLogin");
    }
});

router.get("/adminDeleteAccounts", (req, res) => {
    console.log(req.user);
    if (req.isAuthenticated()) {
        const data = {
            name: req.user.name,
            username: req.user.username,
        };
        res.render("adminDeleteAccount.ejs", data);
    } else {
      res.redirect("/adminLogin");
    }
});

router.get("/adminManageRequests", async (req, res) => {
    console.log(req.user);
    if (req.isAuthenticated()) {
        try {
            const result = await pool.query("SELECT id, name from admins WHERE role = $1", ["Driver"]);
            const drivers = result.rows;
            const data = {
                name: req.user.name,
                username: req.user.username,
                drivers: drivers,
            };
            res.render("adminManageRequests.ejs", data);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to query drivers' });
        }
    } else {
      res.redirect("/adminLogin");
    }
});

router.patch('/requestsAdmins/:id/reschedule', async (req, res) => {
    const { id } = req.params;
  
    try {
      await pool.query("UPDATE collectionRequests SET status = 'reschedule' WHERE id = $1", [id]);
      res.json({ message: 'Request status updated to reschedule' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update request status' });
    }
});

router.patch('/requests/:id/approve', async (req, res) => {
    const requestId = req.params.id;
    const { approvedTime, driverID } = req.body;
    console.log(approvedTime)
    console.log(driverID)
  
    try {
      await pool.query(`
        UPDATE collectionRequests
        SET status = 'approved',
        time = $1,
        driverID = $2
        WHERE id = $3
      `, [approvedTime, driverID, requestId]);
  
      res.json({ message: 'Request approved successfully' });
    } catch (err) {
      console.error('Error approving request:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


export default router;