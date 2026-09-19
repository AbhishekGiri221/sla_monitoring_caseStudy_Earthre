// In excel we have two type of timeStamp 
// ISO 8601:
// 2025-05-08T00:00:00Z. --->. we are storing this format in DB so converting all the data in this same exact format

// Unix timestamp:
// 1746938700

export const cleanTimestamp = (timestamp) => {
    if (
        timestamp === null ||
        timestamp === undefined ||
        timestamp === ""
    ) {
        return null;
    }

    const value = String(timestamp).trim();

    // Unix timestamp

    if (/^\d+$/.test(value)) {
        const date = new Date(Number(value) * 1000); // ---> new date expect ms and unix contains seconds so converting it into ms
        
        if (Number.isNaN(date.getTime())) { // for invalid input
            return null;
        }
        return date.toISOString();
    }

    // ISO timestamp
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString();
};