import React from "react";
import { Link } from "react-router-dom";
import { capitalize } from "../../helpers";

const WordlistCard = (props) => {
    if (props.create) {
        return (
        <Link to={`/create`} >
            <button className="wordlist-card create-card-container">
            <div className="wordlist-create">Create Wordlist +</div>
            <div className="wordlist-card-highlight"></div>
            </button>
        </Link>
        );
    };
    const { list } = props;
    
    if (props.editing==="editing") {
        const isIncluded = props.included.includes(list.id);
        const setToArray = !isIncluded ? [...props.included, list.id] : props.included.filter(id => id!==list.id);
        return (
        <button onClick={() => props.setIncluded(setToArray)} className={`wordlist-card ${isIncluded ? "included" : ""}`}>
            <h2 className="title">{list.title}</h2>
            <div className="wordlist-card-details">
                <p>{`${capitalize(list.langs.split("-")[0])} - ${capitalize(list.langs.split("-")[1])}`}</p>
                <p className="count">{list.length} Items</p>
            </div>
            <div className="wordlist-card-highlight"></div>
        </button>
    )};
    if (props.folder) {
        return (
            <Link to={`/view/${list.name}?${list.id}F`} onClick={() => localStorage.setItem("viewFolderId", list.id)} >
                <button className="wordlist-card">
                    <h2 className="title">{list.name}</h2>
                    <div className="wordlist-card-details">
                        <p className="count">{list.length} Items</p>
                    </div>
                    <div className="wordlist-card-highlight"></div>
                </button>
            </Link>
        );
    };
    return (
        <Link replace to={`/view/${list.title}?${list.id}`} onClick={() => localStorage.setItem("viewListId", list.id)} >
            <button className="wordlist-card">
                <h2 className="title">{list.title}</h2>
                <div className="wordlist-card-details">
                    <p>{`${capitalize(list.langs.split("-")[0])} - ${capitalize(list.langs.split("-")[1])}`}</p>
                    <p className="count">{list.length} Items</p>
                </div>
                <div className="wordlist-card-highlight"></div>
            </button>
        </Link>
        
    );
};

export default WordlistCard;