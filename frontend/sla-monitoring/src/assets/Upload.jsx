import { useState } from "react";
import './Upload.css';
import axios from "axios";
const API_url = "https://leszkwm423.execute-api.eu-north-1.amazonaws.com";


function UploadFile() {
    const [file,setFile] = useState();

    function handleChange(e){
        setFile(e.target.files[0]);

    }

    async function handleSubmit(e) {
        if(!file){
            alert("Please upload file");
            return;
        }

        const csvText = await file.text();

        try {
            const result = await axios.post(`${API_url}/upload`,csvText,{
                headers:{
                    "Content-Type": "text/csv",
                }
            });

            console.log(result.data);
        } catch (error) {
            console.log(error);
        }
    }
    return(
        <>
            <div className="file-container">
                <input 
                    className="file-input" 
                    type="file" 
                    accept=".csv" 
                    onChange={(e) => handleChange(e)}
                />

                <button onClick={(e) => handleSubmit(e)}> Upload </button>
            </div>
        </>
    )
};

export default UploadFile;