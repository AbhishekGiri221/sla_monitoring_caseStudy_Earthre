export const filterRow = (records)=>{
    const seen = new Set();

    return records.filter((value)=>{
        const key = JSON.stringify(value);
        
        if(seen.has(key)){
            return false;
        }

        seen.add(key);
        return true;
    })
}

