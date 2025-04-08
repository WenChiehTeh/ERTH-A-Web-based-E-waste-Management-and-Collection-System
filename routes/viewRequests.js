import express from "express";
import pool from "../config/database.js";

const router = express.Router();

router.get("/viewCollectionRequests", (req, res) => {
    const data = {
        points: req.user.points,
    };
    res.render("viewUpcomingRequests.ejs", data);
});

router.get("/viewPendingRequests", (req, res) => {
    const data = {
        points: req.user.points,
    };
    res.render("viewPendingRequests.ejs", data);
});

// API route to fetch requests
router.get('/api/requests', async (req, res) => {
    const { status = 'pending', page = 1, limit = 5 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    try {
        // Calculate the offset for pagination
        const offset = (pageNum - 1) * limitNum;

        // Query to fetch the paginated requests
        const result = await pool.query(
            `SELECT id, date, firstName, LastName, phoneNo, address, state
             FROM collectionRequests 
             WHERE status = $1 AND userId = $4
             ORDER BY created_at DESC
             LIMIT $2 OFFSET $3`,
            [status, limitNum, offset, req.user.id]
        );

        // Query to get the total number of requests for pagination calculation
        const totalCountResult = await pool.query(
            `SELECT COUNT(*) 
             FROM collectionRequests 
             WHERE status = $1`,
            [status]
        );

        const totalRequests = totalCountResult.rows[0].count;
        const totalPages = Math.ceil(totalRequests / limitNum);

        // Return the response with requests and total pages
        res.json({
            requests: result.rows,
            totalPages: totalPages
        });
    } catch (error) {
        console.error('Error fetching upcoming requests:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

router.get('/api/items/:requestId', async (req, res) => {
    const { requestId } = req.params;

    try {
        const result = await pool.query(
            'SELECT item, quantity FROM collectionRequestsItems WHERE requestid = $1',
            [requestId]
        );
        res.json(result.rows); 
    } catch (err) {
        console.error('Error fetching items:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;