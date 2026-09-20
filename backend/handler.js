import { pool } from "./db.js";
import { parse } from "csv-parse";
import { validateColumns } from "./column_validator.js";
import { getCleanRecord } from "./cleanRecord.js";
import { insertRecords } from "./insertRecord.js";
import { filterRow } from "./duplicateRow_validator.js";
import { parseCSV } from "./parseCsv.js";
import {getStats} from "./stats.js";
import {getLogs} from "./logs.js";

export const handler = async (event, context) => {
    try {
        if (event.rawPath === "/stats" && event.requestContext.http.method === "GET") {

            const stats = await getStats();
        
            return {
                statusCode: 200,
                body: JSON.stringify(stats)
            };
        }
        if (
            event.rawPath === "/logs" &&
            event.requestContext.http.method === "GET"
        ) {
            const params = event.queryStringParameters || {};
        
            const logs = await getLogs(
                params.startDate,
                params.endDate
            );
        
            return {
                statusCode: 200,
                body: JSON.stringify(logs)
            };
        }
        console.log("===== HANDLER STARTED =====");

        console.log("Event received");
        console.log("Body exists:", !!event.body);
        console.log("Body type:", typeof event.body);
        console.log("Base64:", event.isBase64Encoded);

        let csvData = event.body;

        if (!csvData) {
            return {
                statusCode: 400,
                body: JSON.stringify("No data provided")
            };
        }

        console.log("Body received successfully");

        if (event.isBase64Encoded) {
            console.log("Decoding base64 body...");

            csvData = Buffer.from(
                csvData,
                "base64"
            ).toString("utf-8");

            console.log("Base64 decoded");
        }

        console.log("CSV body length:", csvData.length);
        console.log("CSV first 100 chars:", csvData.substring(0, 100));

        const records = await parseCSV(csvData);

        console.log("CSV parsed:", records.length);

        console.log("Before validation");

        const validate = validateColumns(records);

        console.log("After validation:", validate);

        if (!validate.valid) {
            return {
                statusCode: 400,
                body: JSON.stringify(validate.error)
            }
        }

        //filtering Duplicate Records
        console.log("before filteringin rows");
        const filteredRecords = filterRow(records)
        console.log("filtered records")

        //Cleaning messy data
        const cleanRecords = filteredRecords.map((record) => getCleanRecord(record))
        console.log("cleanRecords")
        // console.log(cleanRecords);
        
        
        //inserting clean Records into DB
        console.log("Records to insert:", records.length);

        console.log("Starting database insert...");

        const result = await insertRecords(cleanRecords);

        console.log("Database insert completed");

        console.log("Inserted records:", result);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "CSV Data inserted successfully",
                records: result
            })
        }

    } catch (error) {
        console.error("FULL ERROR:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message,
                stack: error.stack
            })
        };
    }
};