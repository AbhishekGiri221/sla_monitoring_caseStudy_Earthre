import pool from "./db.js";

export const getStats = async () => {

    const result = await pool.query(`
        SELECT
            COUNT(DISTINCT service_id) AS total_services
            COUNT(*) AS total_checks,

            COUNT(*) FILTER (
                WHERE status_code BETWEEN 200 AND 399
            ) AS successful_checks,

            COUNT(*) FILTER (
                WHERE status_code BETWEEN 400 AND 599
            ) AS failed_checks,

            AVG(latency_ms) AS average_latency,

            PERCENTILE_CONT(0.95)
            WITHIN GROUP (
                ORDER BY latency_ms
            ) AS p95_latency

        FROM health_checks
        WHERE latency_ms IS NOT NULL
    `);

    const row = result.rows[0];

    const totalValidChecks =
        Number(row.successful_checks) +
        Number(row.failed_checks);

    const availability =
        totalValidChecks === 0
            ? 0
            : (Number(row.successful_checks) / totalValidChecks) * 100;

    return {
        totalService: Number(row.total_services),
        totalChecks: Number(row.total_checks),
        successfulChecks: Number(row.successful_checks),
        failedChecks: Number(row.failed_checks),
        availability: Number(availability.toFixed(2)),
        averageLatency: Number(Number(row.average_latency).toFixed(2)),
        p95Latency: Number(Number(row.p95_latency).toFixed(2))
    };
};