import pool from "./database.js";

async function deleteOldPendingPayments() {
    try {
        const result = await pool.query(
            "DELETE FROM collections WHERE payment_status = 'pending' AND created_at < NOW() - INTERVAL '24 HOURS'"
        );

        console.log(`Deleted ${result.rowCount} pending payments older than 24 hours`);
    } catch (error) {
        console.error("Error deleting pending payments:", error);
    }
}