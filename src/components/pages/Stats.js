import React, { useEffect, useState } from "react";
import { Line } from 'react-chartjs-2';
import axios from "axios";
import Header from "../parts/Header";
import ErrorFlash from "../parts/ErrorFlash";

const Stats = (props) => {
    console.log(props)
    const wordlist = props.location.pathname.split("/")[2];
    const [userData, setUserData] = useState([]);
    const [userLabels, setUserLabels] = useState([]);
    const [wordlistItems, setWordlistItems] = useState([]);
    const [viewItem, setViewItem] = useState({});
    const [expanded, setExpanded] = useState(false);
    const [error, setError] = useState([]);
    let errorCount = 0;
    let query = "stats";
    console.log(wordlist)
    if (!wordlist) query = "all-stats";
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_ADDRESS}/${query}`, {
            params: {
                id: localStorage.getItem("statsWordlistId"),
            },
        })
        .then(res => {
            const { wordlistItems } = res.data;
            let answerArray = [];
            const wordlistItemsSorted = [...wordlistItems];
            
            wordlistItemsSorted.forEach(item => {
                item.score = item.test_answers.reduce((acc, cur) => {return cur.correct ? acc+1 : acc-1}, 0);
            });
            wordlistItemsSorted.sort((a,b) => {return b.score-a.score});
            wordlistItems.forEach(item => {
                item.test_answers.forEach(answer => {
                    answerArray.push(answer);
                });
            });
            let dataArray = [];
            let labelArray = [];
            answerArray.sort((prev, next) => {return prev.id - next.id}).forEach(answer => {
                dataArray = [...dataArray, (dataArray[dataArray.length-1] || 0) + (answer.correct_percentage===100 ? 1 : answer.correct_percentage/100 -1)];
                labelArray = [...labelArray, `${answer.answer}-${answer.correct_answer}`];
            });
            if (dataArray.length===0) {
                dataArray = "No Data";
            };
            setUserData(dataArray);
            setUserLabels(labelArray);
            setWordlistItems(wordlistItemsSorted);
        })
        .catch((err) => {
            if (!error.filter(e => e.msg === err.response.data.msg).length) {
                setError([...error, err.response.data]);
            };
        });
    }, [wordlist, error, query]);
    
    const options = {
        title:{
            display:true,
            text:`User Stats for ${wordlist}`,
            fontSize:20,
        },
        legend:{
            display:true,
            position:'right',
        },
    };
    const data = {
        labels: userLabels,
        datasets: [{
            label: 'Cumulative Score',
            fill: false,
            lineTension: 0.4,
            backgroundColor: "rgb(93, 80, 207)",
            borderColor: 'rgba(0,0,0,1)',
            borderWidth: 2,
            data: userData,
        }],
    };

    if (userData==="No Data") {
        return (
            <div className="page-container">
                <Header />
                <h2 className="page-title">{wordlist ? `${wordlist} -` : ""}Stats</h2>
                <p>No data to display!</p>
            </div>
    )};
    if (!userData.length) {
        return (
            <div className="page-container">
                {error.map(err => {
                    errorCount++;
                    return (
                        <ErrorFlash key={`error-${errorCount}`} errorList={error} errorNum={errorCount} setError={setError} error={err} />
                    );
                })}
                <Header />
                <p>Loading ...</p>
            </div>
    )};
    let expandCount = 0;
    return (
        <div className="page-container">
            <Header />
            <h2 className="page-title">{wordlist ? `${wordlist} - `: "Your "}Stats</h2>
            <div className="graph-container">
                <Line
                data={data}
                options={options}
                height={350}
                width={800}
                />
            </div>
            <div className="answers-container">
                {viewItem.word ? 
                    <div className="container">
                        <button onClick={() => setViewItem({})} className="slide-button back">←</button>
                        <div className="card">
                            <h2 className="test-answer-header">{`${viewItem.word} - ${viewItem.translation}`}</h2>
                            <div className="test-answer-container container">
                            {viewItem.test_answers.map(ans => {
                                let type = "pos";
                                if (!ans.correct) type="neg";
                                return (<div className={`${type} test-answer`}>{ans.answer} - {ans.correct_answer}</div>);
                            })}
                        </div>
                    </div>

                </div> : (
                    <div className="column">
                    <button className="slide-button stats-cards-button" onClick={() => setExpanded(!expanded)}>{expanded ? "Show less -" : "Show all +"}</button>
                    <div className="container stats-cards">{wordlistItems.map(item => {
                        if (!expanded && expandCount>10) return "";
                        let type = "neut";
                        if (item.score>0) type="pos";
                        if (item.score<0) type="neg";
                        expandCount++;
                        return (
                            <button onClick={() => setViewItem(item)} className={`card stats ${type}`}>
                                {`${item.word} - ${item.translation}`}
                                <div className="score">{item.score>0?"+":""}{item.score}</div>
                            </button>
                        )})}
                        
                    </div>
                    </div>
                    )}
            </div>
        </div>
    );
};

export default Stats;