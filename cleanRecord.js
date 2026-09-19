import { cleanTimestamp } from "./timeStamp_validator.js";
import { cleanStatusCode } from "./statusCode_validator.js";
import { cleanLatency } from "./latency_validator.js";

export const getCleanRecord = (records) =>{
    return{
        service_id : records.service_id?.trim(),
        service_name : records.service_name?.trim(),
        timestamp : cleanTimestamp(records.timestamp),
        status_code : cleanStatusCode(records.status_code),
        latency_ms : cleanLatency(records.latency,records.latency_unit),
        agent : records.agent,
        region : records.region
    };
};