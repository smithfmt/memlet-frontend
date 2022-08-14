import React, { useEffect, useState } from "react";
import { Link, useHistory } from 'react-router-dom';
import axios from "axios";
import Header from "../parts/Header";
import Learncard from "../parts/Learncard";
import { shuffle, capitalize } from "../../helpers";
import ErrorFlash from "../parts/ErrorFlash";

const Learn = (props) => {
    let history = useHistory();
    const wordlist = props.location.pathname.split("/")[3];
    const [validList, setValidList] = useState({});
    const [selectedLang, setSelectedLang] = useState("lang1")
    const [current, setCurrent] = useState(1);
    const [shuffledList, setShuffledList] = useState([]);
    const [score, setScore] = useState(0);
    const [dynamic, setDynamic] = useState(false);
    const [learnEverything, setLearnEverything] = useState(false);
    const [error, setError] = useState([]);
    const [showResults, setShowResults] = useState(false);
    let errorCount = 0;
    if (props.match.path.split("/")[2]==="dynamic" && !dynamic) {setDynamic(true)}
    if (!wordlist && !learnEverything) {setLearnEverything(true)};

    useEffect(() => {
        let listType = "play";
        if (dynamic) {
            listType="dynamic"
            if (learnEverything) listType="everything-dynamic";
        } else if (learnEverything) listType="everything";
        axios.get(`${process.env.REACT_APP_API_ADDRESS}/${listType}`, {
            params: {
                id: localStorage.getItem("playWordlistId"),
            },
        })
        .then(res => {
            const valid = res.data.wordlist;
            if (!valid.words) {
                console.log("No Wordlist found!")
                history.push("/dashboard")
            } else {
                setValidList(valid);
                if (!dynamic) {setShuffledList(shuffle(valid.words))}
                else {setShuffledList(valid.words)};              
            };
        })
        .catch((err) => {
            if (!error.filter(e => e.msg === err.response.data.msg).length) {
                setError([...error, err.response.data]);
            };
        });      
    }, [history, wordlist, dynamic, error, learnEverything]);

    let cardId = 1;

    const changeCard = (correct) => {
        if (showResults) return;
        if (correct) setScore(score+1);
        if (current===validList.words.length) setShowResults(true);
        setCurrent(current+1);
        const currentCard = document.getElementById(`learncard-input-${current+1}`);
        if (currentCard) currentCard.select();
    };

    if (!validList.words) {
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
    
    let resultsMessage = "Perfect score! You know this very well!";
    if (((score/validList.words.length)*100)<100) {
        resultsMessage = "Well done! You did well! Just a little more work needed.";
    };
    if (((score/validList.words.length)*100)<80) {
        resultsMessage = "Good work! You know most of these words!";
    };
    if (((score/validList.words.length)*100)<60) {
        resultsMessage = "Ok! work is needed, but you clearly know some of these words!";
    };
    if (((score/validList.words.length)*100)<40) {
        resultsMessage = "Not great! Clearly work is needed on these!";
    };
    let title = "Learn";
    if (dynamic) title="Dynamic";
    if (learnEverything) title="Everything";

    let [lang1, lang2] = validList.langs.split("-");
    if (shuffledList.length&&shuffledList[current-1]) {
        let togLangs = shuffledList[current-1].langs.split("-");
        lang1 = togLangs[0];
        lang2 = togLangs[1];
    };
    
    return (
        <div className="page-container">
            <Header />
            <h2 className="page-title">{validList.title} - {title}</h2>
            {!showResults?
            <div className="learn-container">
                <div className="language-toggle-container">
                    {`${capitalize(lang1)} - ${capitalize(lang2)}`}
                    <div className={`language-toggle ${selectedLang}`}>
                        <button className={`lang1-button ${selectedLang}`} onClick={() => {setSelectedLang("lang1")}} ></button>
                        <button className={`lang2-button ${selectedLang}`} onClick={() => {setSelectedLang("lang2")}} ></button>
                    </div>
                    <div className="learn-progress-bar-outer">
                        <div className="learn-progress-bar-inner" style={{width: `${((current-1)/(shuffledList.length))*100}%`}}></div>
                    </div>
                    <h2>{`${current-1}/${shuffledList.length}`}</h2>
                </div>
                {shuffledList.map((wordpair) => {
                    const thisId = cardId;
                    cardId++;
                    return (
                        <Learncard error={error} setError={setError} key={thisId} id={thisId} wordpair={wordpair} selectedLang={selectedLang} current={current} changeCard={changeCard} />
                    );
                })}  
            </div>
            :
            <div className="learncard-container">
                <div className={`learncard current results`}>
                    <div className="results-card">
                        <h2>Results:</h2>
                        <div>You got {`${score}/${validList.words.length}`} right!</div>
                        <div>That's <strong>{Math.floor((score/validList.words.length)*100)}%</strong></div>
                        <div>{resultsMessage}</div>
                        <div className="container">
                            <button className="slide-button results-button"><Link to={`/play/${wordlist}`} replace >Return to Play →</Link></button>
                            <button className="slide-button" onClick={() => window.location.reload()}>Play Again 🗘</button>
                        </div>
                        
                    </div>
                </div>
            </div>
            }
        </div>
    );
};

export default Learn;