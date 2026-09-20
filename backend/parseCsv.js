import { parse } from "csv-parse";

export const parseCSV = (csvData) => {
    return new Promise((resolve, reject) => {
        parse(
            csvData,
            {
                columns: true,
                skip_empty_lines: true,
                trim: true
            },
            (error, records) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(records);
                }
            }
        );
    });
};