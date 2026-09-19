import { useState } from "react";

const API_url = "https://leszkwm423.execute-api.eu-north-1.amazonaws.com";


function UploadFile() {
    const [file,setFile] = useState();
    return(
        <>
            <div className="file-container">
                <input type="file" accept=".csv" />

                <button> Upload </button>
            </div>
        </>
    )
};

export default UploadFile;