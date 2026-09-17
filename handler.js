import { pool } from "./db.js";
import { parse } from "csv-parse/sync";
import  { validateColumns } from "./column_validator.js";
import { getCleanRecord } from "./cleanRecord.js";
import {insertRecord} from "./insertRecord.js";
export const handler = async (event, context) => {
    try {
       
        let csvData = event.body;

        if(event.isBase64Encoded){
            csvData = Buffer.from(csvData, 'base64').toString('utf-8');
        }

        if(!csvData){
            return{
                statusCode: 400,
                body: JSON.stringify("No data provided")
            }
        }

        const records = parse(csvData, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        const validate = validateColumns(records);

        if(!validate.valid){
            return{
                statusCode: 400,
                body: JSON.stringify(validate.error)
            }
        }

        const cleanRecords = records.map((record) => getCleanRecord(record))

        // console.log(cleanRecords);

        //inserting clean Records into DB
        const result = await insertRecord(cleanRecords);

        return{
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