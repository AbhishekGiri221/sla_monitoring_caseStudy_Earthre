import {pool} from "./db.js";

export const getStats = async () => {

    const result = await pool.query(`
        SELECT
            COUNT(*) AS total_checks,

            COUNT(*) FILTER (
                WHERE status_code BETWEEN 200 AND 399
            ) AS successful_checks,

            COUNT(*) FILTER (
                WHERE status_code BETWEEN 400 AND 599
            ) AS failed_checks

        FROM health_checks
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
        totalChecks: Number(row.total_checks),
        successfulChecks: Number(row.successful_checks),
        failedChecks: Number(row.failed_checks),
        availability: Number(availability.toFixed(2))
    };
};