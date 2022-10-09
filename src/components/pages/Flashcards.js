import React, { useEffect, useState, useReducer } from "react";
import { useHistory } from 'react-router-dom';
import axios from "axios";
import Header from "../parts/Header";
import Flashcard from "../parts/Flashcard";
import ErrorFlash from "../parts/ErrorFlash";

const Flashcards = (props) => {
    let history = useHistory();
    const wordlist = props.location.pathname.split("/")[3];
    let wordlistId = props.location.search.split("?")[1];
    let folderId = null;
    if (wordlistId&&wordlistId.includes("F")) folderId = wordlistId.split("F")[0];
    const [validList, setValidList] = useState([]);
    const [learnEverything, setLearnEverything] = useState(false);
    const [error, setError] = useState([]);
    let errorCount = 0;
    if (!wordlist && !learnEverything) {setLearnEverything(true)};

    useEffect(() => {
        let listType = "play";
        if (learnEverything) listType="everything";
        let params = {id: localStorage.getItem("playWordlistId")};
        if (folderId) params.folderId = folderId;
        axios.get(`${process.env.REACT_APP_API_ADDRESS}/${listType}`, { params })
        .then(res => {
            const valid = res.data.wordlist.words;
            if (!valid.length) {
                console.log("No Wordlist found!")
                history.push("/dashboard")
            } else {
                setValidList(valid);
            };
        })
        .catch((err) => {
            if (!error.filter(e => e.msg === err.response.data.msg).length) {
                setError([...error, err.response.data]);
            };
        });
    }, [history, wordlist, error, learnEverything]);

    let cardId = 1;

    const reducer = (state, action) => {
        switch (action.dir) {
            case "forward":
                if (state===validList.length) return state;
                else return state+1;
            case "back": 
                if (state===1) return state;
                else return state-1;
            default:
                throw new Error();
        };
    };
    const [current, changeCard] = useReducer(reducer, 1);

    useEffect(() => {
        const keyDown = (e) => {
            if (e.key === "ArrowRight") {
                changeCard({dir: "forward"});
            } else if (e.key === "ArrowLeft") {
                changeCard({dir: "back"});
            };
        };
        window.addEventListener("keydown", keyDown)
        return (() => window.removeEventListener("keydown", keyDown))
    }, [])

    if (!validList.length) {
        return (
            <div className="page-container">
                {error.map(err => {
                    errorCount++;
                    return (
                        <ErrorFlash key={`error-${errorCount}`} errorList={error} errorNum={errorCount} setError={setError} error={err} />
                    );
                })}
                <Header />
                <p>Loading...</p>
            </div>
        );
    };
  
    return (
        <div className="page-container">
            <Header />
            <h2 className="page-title fade-underline">{wordlist ? `${wordlist} - ` : ""}Flashcards</h2>
            <div className="flashcards-page-container">
            <div className="flashcard-container">
                <Flashcard key={-1} id={-1} wordpair={{word: "", translation: ""}} current={current} />
                <Flashcard key={0} id={0} wordpair={{word: ">", translation: ">"}} current={current} />
                {validList.map(word => {
                    const thisId = cardId;
                    cardId++
                    return (
                        <Flashcard key={thisId} id={thisId} wordpair={word} current={current} />
                    );
                })}
                <Flashcard key={cardId} id={cardId} wordpair={{word: "<", translation: "<"}} current={current} />
                <Flashcard key={cardId+1} id={cardId+1} wordpair={{word: "", translation: ""}} current={current} />
            </div>
            </div>
            <div className="flashcard-nav">
                <button className="slide-button" onClick={() => changeCard({dir: "back"})}><strong>{"<"}</strong></button>
                <div className="flashcards-number container">{current}</div>
                <button className="slide-button" onClick={() => changeCard({dir: "forward"})}><strong>{">"}</strong></button>   
            </div>
        </div>
    );
};

export default Flashcards;