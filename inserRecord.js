import { pool } from "./db.js";

export const insertRecords = async (records) => {
    const client = await pool.connect();
    try {

        await client.query('BEGIN');

        const query = `INSERT INTO health_checks
                       (
                        service_id,
                        service_name,
                        timestamp,
                        status_code,
                        latency_ms,
                        agent,
                        region
                       )
                        VALUES (
                            $1,$2,$3,$4,$5,$6,$7
                        )
                        RETURNING *;`
        for(const record of records){
            await client.query(query,
                [record.service_id,
                record.service_name,
                record.timestamp,
                record.status_code,
                record.latency_ms,
                record.agent,
                record.region,
            ]);
        }

        await client.query("COMMIT");

        return records.length;

    } catch (error) {
        await client.query('ROLLBACK');
        console.log(`Database error is : ${error}`);
        throw error;
    }finally{
        client.release();
    }
}