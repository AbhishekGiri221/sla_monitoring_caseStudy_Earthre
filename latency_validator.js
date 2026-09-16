const cleanLatency = (latency,unit) => {
    if (latency === null || latency === undefined || latency === "") {
        return null;
    }

    const value = Number(latency);

    if(Number.isNaN(value)){
        return null
    }

    if(value < 0){
        return null
    }

    if(unit === 'ms' ){
        return value
    }

    if(unit === 's'){
        return Math.round(value*1000)
    }

    return null;
}
