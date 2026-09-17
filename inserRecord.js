import { pool } from "./db.js";

export const insertRecord = async (record) => {

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
                    RETURNING *;
                    `

    try {
        const result = await pool.query(query,
            [record.service_id,
            record.service_name,
            record.timestamp,
            record.status_code,
            record.latency_ms,
            record.agent,
            record.region,
        ]);

        return result.rows[0];


    } catch (error) {
        console.log(`Database error is : ${error}`);

        throw error;
    }
}