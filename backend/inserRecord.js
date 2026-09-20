import {pool} from "./db.js";
const BATCH_SIZE = 500;

export const insertRecords = async (records) => {
    console.log("Database connection acquired");

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        console.log("Transaction started");

        for (let start = 0; start < records.length; start += BATCH_SIZE) {

            const batch = records.slice(start, start + BATCH_SIZE);

            const values = [];
            const placeholders = [];

            batch.forEach((record, index) => {

                const offset = index * 7;

                placeholders.push(
                    `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7})`
                );

                values.push(
                    record.service_id,
                    record.service_name,
                    record.timestamp,
                    record.status_code,
                    record.latency_ms,
                    record.agent,
                    record.region
                );
            });

            const query = `
                INSERT INTO health_checks
                (
                    service_id,
                    service_name,
                    timestamp,
                    status_code,
                    latency_ms,
                    agent,
                    region
                )
                VALUES ${placeholders.join(", ")}
            `;

            console.log(
                `Inserting batch: ${start} - ${start + batch.length}`
            );
            await client.query("DELETE FROM health_checks");
            await client.query(query, values);
        }

        await client.query("COMMIT");

        console.log("Transaction committed");

        return records.length;

    } catch (error) {

        await client.query("ROLLBACK");

        console.log(`Database error is : ${error}`);

        throw error;

    } finally {

        client.release();
    }
};