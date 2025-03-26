import pool from "../config/database.js";

//function to delete pending payments that were created 24 hours ago
export async function deleteOldPendingPayments() {
    try {
        //query to delete rows that have outstanding payment for more than 24 hours
        const result = await pool.query("DELETE FROM collectionRequests WHERE status = 'payment' AND created_at < NOW() - INTERVAL '24 HOURS'");

        //log the result in terminal
        console.log(`Deleted ${result.rowCount} pending payments older than 24 hours`);
    } catch (error) {
        //catch any errors
        console.error("Error deleting pending payments:", error);
    }
}