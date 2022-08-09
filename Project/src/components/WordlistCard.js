import React from "react";
import { Link } from "react-router-dom";

const WordlistCard = (props) => {
    return (
        <Link to={`edit`} onClick={() => localStorage.setItem("editWordlistId", props.id)} >
            <button className="wordlist-card">
                {props.title}
            </button>
        </Link>
        
    );
};

export default WordlistCard;