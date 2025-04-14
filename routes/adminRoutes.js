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

router.get("/adminManageEwaste", async (req, res) => {
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
          res.render("adminManageEwaste.ejs", data);
      } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Failed to query drivers' });
      }
  } else {
    res.redirect("/adminLogin");
  }
});

router.patch('/requests/:id/reschedule', async (req, res) => {
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

router.patch('/requests/ewaste/:id/approve', async (req, res) => {
  const requestId = req.params.id;
  const { approvedTime, driverID } = req.body;

  try {
    await pool.query(`
      UPDATE processRequests
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

router.get('/api/ewaste/requestsAdmin', async (req, res) => {
    const { status = 'Pending' } = req.query;

    try {
        // Query to fetch the paginated requests
        const result = await pool.query(
            `SELECT id, type, date
             FROM processRequests
             WHERE status = $1
             ORDER BY id ASC
            `,
            [status]
        );
        // Return the response with requests and total pages
        res.json({
            requests: result.rows,
        });
    } catch (error) {
        console.error('Error fetching upcoming requests:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

router.get('/api/ewaste/items/:requestId', async (req, res) => {
  const { requestId } = req.params;

  try {
      const result = await pool.query(
          'SELECT item, quantity FROM processRequestsItems WHERE requestid = $1',
          [requestId]
      );
      res.json(result.rows); 
  } catch (err) {
      console.error('Error fetching items:', err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/api/requests/:id/delete', async (req, res) => {
  const requestId = req.params.id;

  try {
    // Get the items from the request
    const getItems = await pool.query(
      "SELECT item, quantity FROM processRequestsItems WHERE requestId = $1",
      [requestId]
    );

    // Restore each item into warehouse
    const restorePromises = getItems.rows.map(element => {
      return pool.query(
        "INSERT INTO warehouse(item, quantity) VALUES($1, $2)",
        [element.item, element.quantity]
      );
    });

    // Wait for all insertions to complete
    await Promise.all(restorePromises);

    // Delete the request
    const result = await pool.query(
      'DELETE FROM processRequests WHERE id = $1',
      [requestId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    res.status(200).json({ message: 'Request deleted successfully', request: result.rows[0] });

  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;