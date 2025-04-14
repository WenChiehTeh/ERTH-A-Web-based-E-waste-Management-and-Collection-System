import pool from "../config/database.js";

export async function updateCollectionRequestsStatus() {
    try {
        const { rows: updatedRequests } = await pool.query("UPDATE collectionRequests SET status = 'completed' WHERE  status = 'approved' AND date < CURRENT_DATE RETURNING id;");

        const updatedIds = updatedRequests.map(req => req.id);

        if (updatedIds.length === 0) {
            console.log("No collection requests to update.");
            return;
        }

        await pool.query(
            `INSERT INTO warehouse (item, quantity)
             SELECT item, quantity
             FROM collectionRequestsItems
             WHERE requestId = ANY($1::int[])`,
            [updatedIds]
        );

        console.log(`Updated ${updatedIds.length} requests and moved their items into the warehouse.`);
    } catch (error) {
        console.error("Error updating collection request statuses:", error);
    }
}