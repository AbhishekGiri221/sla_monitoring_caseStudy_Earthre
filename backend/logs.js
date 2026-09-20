import {pool} from "./db.js";

export const getLogs = async (startDate, endDate) => {

    let query = `
        SELECT
            service_id,
            service_name,
            timestamp,
            status_code,
            latency_ms,
            agent,
            region
        FROM health_checks
    `;

    const values = [];

    if (startDate && endDate) {
        query += `
            WHERE timestamp >= $1
            AND timestamp < $2
        `;

        values.push(startDate);
        values.push(endDate);
    }

    query += `
        ORDER BY timestamp DESC
    `;

    const result = await pool.query(query, values);

    return result.rows;
};