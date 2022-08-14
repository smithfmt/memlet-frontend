import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import Header from "../parts/Header";

const NotFound = () => {
    let history = useHistory();

    useEffect(() => {
        setTimeout(() => {
            history.push("/dashboard");
        }, 2000)
    }, [history]);
    
    return (
        <div className="page-container">
            <Header />
            <h2>Nothing to see here...</h2>
        </div>
    );
};

export default NotFound;