import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "./Header";
import ErrorFlash from "./ErrorFlash";

const NewPage = () => {
    const [error, setError] = useState([]);
    let errorCount = 0;

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_ADDRESS}/newPage`)
        .then(res => {
            
        })
        .catch((err) => {
            if (!error.filter(e => e.msg === err.response.data.msg).length) {
                setError([...error, err.response.data]);
            };
        });
    }, [error]);

    return (
        <div className="page-container">
            {error.map(err => {
                errorCount++;
                return (
                    <ErrorFlash key={`error-${errorCount}`} errorList={error} errorNum={errorCount} setError={setError} error={err} />
                );
            })}
            <Header />
            <h2 className="page-title">newPage</h2>
        </div>
    );
};

export default NewPage;