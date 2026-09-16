// filtering duplicate row by matching the index of it's first occurence to it's current occurence

const filterRows = (records)=>{
    return records.filter((value,index,array) => {
        return index === array.findIndex(item => JSON.stringify(item) === JSON.stringify(value))
    })
}

