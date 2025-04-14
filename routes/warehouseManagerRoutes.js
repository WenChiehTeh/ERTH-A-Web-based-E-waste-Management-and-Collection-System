import express from "express"; 
import pool from "../config/database.js";

const router = express.Router();

router.get("/warehouseManager", (req, res) => {
    console.log(req.user);
    if (req.isAuthenticated()) {
      const data = {
          name: req.user.name,
          username: req.user.username,
      };
      res.render("warehouseManager.ejs", data);
  } else {
    res.redirect("/adminLogin");
  }
});

router.get('/api/loadWarehouse', async (req, res) => {
    try {
      const warehouse = await pool.query("SELECT item, SUM(quantity) AS quantity FROM warehouse GROUP BY item");
  
      res.json(warehouse.rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch accounts' });
    }
});

router.post('/api/processWarehouse', async (req, res) => {
    const { process, date, items } = req.body;

    try {
        // 1. Check stock for all items first
        for (const { item, quantity } of items) {
            const check = await pool.query(
                'SELECT item, SUM(quantity) AS quantity FROM warehouse WHERE item = $1 GROUP BY item',
                [item]
            );

            if (!check.rows.length || check.rows[0].quantity < quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${item}` });
            }
        }

        // 2. Insert into processRequests and get the new ID
        const insertRequest = await pool.query(
            'INSERT INTO processRequests (type, date) VALUES ($1, $2) RETURNING id',
            [process, date]
        );
        const requestId = insertRequest.rows[0].id;

        // 3. Process each item
        for (const { item, quantity } of items) {

            // a. Update warehouse stock
            await pool.query(
                'INSERT INTO warehouse(item, quantity) VALUES ($1, $2)',
                [item, -quantity]
            );

            // b. Insert into processRequestsItems
            await pool.query(
                'INSERT INTO processRequestsItems (requestID, item, quantity) VALUES ($1, $2, $3)',
                [requestId, item, quantity]
            );
        }

        res.status(200).json({ message: 'Warehouse items processed successfully.' });
    } catch (error) {
        console.error('Error processing warehouse request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;