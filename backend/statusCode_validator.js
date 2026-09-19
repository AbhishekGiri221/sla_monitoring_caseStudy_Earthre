export const cleanStatusCode = (statusCode)=>{
    if(statusCode === null || statusCode === undefined || statusCode === ""){
        return null
    }

    const value = Number(statusCode);

    if(Number.isNaN(value)){
        return null
    }

    if(statusCode < 100 || statusCode > 599){
        return null
    }

    return value;
}