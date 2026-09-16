const requiredColumns = [
    "service_id",
    "service_name",
    "timestamp",
    "status_code",
    "latency",
    "latency_unit",
    "agent",
    "region"
];

export const validateColumns = (record)=>{
    if(record.length == 0){
        return{
            valid : false,
            error : "Empty record"
        }
    }

    const recordColumn = Object.keys(record);

    const missingColumns = requiredColumns.filter(column => !recordColumn.includes(column));

    if(missingColumns.length > 0){
        return {
            valid : false,
            error: `missing columns are ${missingColumns.join(", ")}`
        }
    }

    return {
        valid : true,
    };

}