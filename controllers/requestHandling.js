import pool from "../config/database.js";

export async function updateCollectionRequestsStatus() {
    try {
        const result = await pool.query("UPDATE collectionRequests SET status = 'completed' WHERE  status = 'approved' AND date < CURRENT_DATE;");

        console.log(`Updated status of ${result.rowCount} collection requests.`);
    } catch (error) {
        console.error("Error updating collection request statuses:", error);
    }
}