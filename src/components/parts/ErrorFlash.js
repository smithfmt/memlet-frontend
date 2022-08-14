import React from "react";

const ErrorFlash = (props) => {
    const {error, setError, errorNum, errorList} = props;
    return (
        <div className="error-flash-container" style={{top: `${(errorNum)*16 +2}%`}} >
            <div className="error-flash">
                {error.msg || "Sorry! This page has failed to load"}
                <button className="error-flash-close" onClick={() => setError([...errorList.filter(err => err!==error)])} >x</button>
            </div>
        </div>
    );
};

export default ErrorFlash;