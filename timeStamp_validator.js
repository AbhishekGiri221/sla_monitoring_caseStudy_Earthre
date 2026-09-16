const cleanTimestamp = (timestamp) => {
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
        const date = new Date(Number(value) * 1000); // ---> new date expect ms and unix contains seconds so conver it into ms
        
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