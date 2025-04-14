import express from "express"; 
import pool from "../config/database.js";

const router = express.Router();

router.get("/driverCollectionRequests", async (req, res) =>  {
    console.log(req.user);
    if (req.isAuthenticated()) {
      const data = {
          name: req.user.name,
          username: req.user.username,
      };
      res.render("driverUpcomingCollection.ejs", data);
  } else {
    res.redirect("/adminLogin");
  }
});

router.get("/driverRecyclingTrips", async (req, res) =>  {
  console.log(req.user);
  if (req.isAuthenticated()) {
    const data = {
        name: req.user.name,
        username: req.user.username,
    };
    res.render("driverUpcomingRecycling.ejs", data);
} else {
  res.redirect("/adminLogin");
}
});

router.get("/driverRefurbishTrips", async (req, res) =>  {
  console.log(req.user);
  if (req.isAuthenticated()) {
    const data = {
        name: req.user.name,
        username: req.user.username,
    };
    res.render("driverUpcomingRefurbish.ejs", data);
} else {
  res.redirect("/adminLogin");
}
});

router.patch('/api/requestsDriver', async (req, res) => {
  
    try {
      await pool.query(            
        `SELECT collectionRequests.id, date, time, firstName, LastName, phoneNo, address, state, vehicleType, numberPlate, name
        FROM collectionRequests 
        JOIN driver ON collectionRequests.driverid = driver.driverid
        JOIN admins ON collectionRequests.driverid = admins.id
        WHERE status = $1
        ORDER BY date ASC
        `,
       ["approved"]);
      res.json({ message: 'Request status updated to reschedule' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update request status' });
    }
});

router.get('/api/requestsDriver', async (req, res) => {

    try {

        // Query to fetch the requests
        const result = await pool.query(
            `SELECT collectionRequests.id, date, time, firstName, LastName, phoneNo, address, state, vehicleType, numberPlate, name
             FROM collectionRequests 
             JOIN driver ON collectionRequests.driverid = driver.driverid
             JOIN admins ON collectionRequests.driverid = admins.id
             WHERE status = $1 AND collectionRequests.driverID = $2
             ORDER BY date ASC
            `,
            ["approved", req.user.id]
        );

        console.log(result.rows);

        // Return the response with requests and total pages
        res.json({
            requests: result.rows,
        });
    } catch (error) {
        console.error('Error fetching upcoming requests:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

router.get('/api/ewaste/requestsDriver', async (req, res) => {

  try {

      // Query to fetch the requests
      const result = await pool.query(
          `SELECT id, type, date, time
           FROM processRequests
           WHERE status = $1 AND driverID = $2 AND type = $3
           ORDER BY date ASC
          `,
          ["approved", req.user.id, "Recycle"]
      );

      console.log(result.rows);

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

router.get('/api/refurbish/requestsDriver', async (req, res) => {

  try {

      // Query to fetch the requests
      const result = await pool.query(
          `SELECT id, type, date, time
           FROM processRequests
           WHERE status = $1 AND driverID = $2 AND type = $3
           ORDER BY date ASC
          `,
          ["approved", req.user.id, "Refurbish"]
      );

      console.log(result.rows);

      // Return the response with requests and total pages
      res.json({
          requests: result.rows,
      });
  } catch (error) {
      console.error('Error fetching upcoming requests:', error);
      res.status(500).json({ error: 'Failed to fetch requests' });
  }
});


export default router;