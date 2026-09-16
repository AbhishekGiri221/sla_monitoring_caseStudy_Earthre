import { pool } from "./db.js";
import { parse } from "csv-parse/sync";
import  { validateColumns } from "./column_validator.js";

export const handler = async (event, context) => {
    try {
        const csvData = event.body;

        console.log(csvData, " ", csvData.body);

        if(event.isbase64Encoded){
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