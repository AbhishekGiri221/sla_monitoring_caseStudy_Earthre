export const filterRow = (records)=>{
    return records.filter((value,index,array)=>{
        return index === array.findIndex(obj => JSON.stringify(obj) === JSON.stringify(value));
    })
}

