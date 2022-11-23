import React, { useEffect, useState } from "react";
import { Link, useHistory } from 'react-router-dom';
import axios from "axios";
import { Line } from 'react-chartjs-2';
import Header from "../parts/Header";
import ErrorFlash from "../parts/ErrorFlash";
import WordPair from "../parts/WordPair";
import LanguageSelect from "../parts/LanguageSelect";
import WordlistCard from "../parts/WordlistCard";
import { capitalize } from "../../helpers";

function importAll(r) {
    let images = {};
    r.keys().forEach((item, index) => { images[item.replace('./', '')] = r(item); });
    return images;
};
const images = importAll(require.context('../../images/Play', false, /\.(png|jpe?g|svg)$/));

const View = (props) => {
    let history = useHistory();
    const wordlist = props.match.params.wordlist;
    const [viewList, setViewList] = useState({});
    const [folder, setFolder] = useState(false);
    const [userData, setUserData] = useState([]);
    const [userLabels, setUserLabels] = useState([]);
    const [error, setError] = useState([]);
    const [expand, setExpand] = useState(false);
    let errorCount = 0;

    let type = "wordlist";
    let wordlistId = props.location.search.split("?")[1];
    if (wordlistId.includes("F")) {
        type = "folder";
        wordlistId = wordlistId.split("F")[0];
    };

    useEffect(() => {
        if (type === "wordlist") {
            if (folder) setFolder(false);
            axios.get(`${process.env.REACT_APP_API_ADDRESS}/stats`, {
                params: {
                    id: parseInt(wordlistId),
                },
            })
            .then(res => {
                const { wordlistItems } = res.data;
                let answerArray = [];
                wordlistItems.forEach(item => {
                    item.test_answers.forEach(answer => {
                        answerArray.push(answer);
                    });
                });
                answerArray = answerArray.length>100?answerArray.slice(answerArray.length-100,answerArray.length):answerArray;
                let dataArray = [];
                let labelArray = [];
                answerArray.sort((prev, next) => {return prev.id - next.id}).forEach(answer => {
                    dataArray = [...dataArray, (dataArray[dataArray.length-1] || 0) + (answer.correct_percentage===100 ? 1 : answer.correct_percentage/100 -1)];
                    let nextLabel = `${answer.answer}-${answer.correct_answer}`;
                labelArray.push(nextLabel);
                });
                if (dataArray.length===0) {
                    dataArray = "No Data";
                };
                setUserData(dataArray);
                setUserLabels(labelArray);
            })
            .catch((err) => {
                if (!error.filter(e => e.msg === err.response.data.msg).length) {
                    setError([...error, err.response.data]);
                };
            });
            axios.get(`${process.env.REACT_APP_API_ADDRESS}/explore-list`, {
                params: {
                    id: parseInt(wordlistId),
                },
            })
            .then(res => {
                setViewList(res.data.wordlist);
            })
            .catch((err) => {
                if (!error.filter(e => e.msg === err.response.data.msg).length) {
                    setError([...error, err.response.data]);
                };
            });
        } else {
            if (!folder) {
                axios.get(`${process.env.REACT_APP_API_ADDRESS}/folderById`, {
                    params: {
                        id: parseInt(wordlistId),
                    },
                })
                .then(res => {
                    const folderData = res.data.folder;
                    folderData.wordlists.sort((a,b) => {
                        if (a.title>b.title) return 1;
                        if (b.title>a.title) return -1;
                        return 0;
                    });
                    setFolder(folderData);
                    axios.get(`${process.env.REACT_APP_API_ADDRESS}/folder-stats`, {
                        params: {
                            id: parseInt(res.data.folder.id),
                        },
                    })
                    .then(res => {
                        const { wordlistItems } = res.data;
                        let answerArray = [];
                        wordlistItems.forEach(item => {
                            item.test_answers.forEach(answer => {
                                answerArray.push(answer);
                            });
                        });
                        let dataArray = [];
                        let labelArray = [];
                        answerArray.sort((prev, next) => {return prev.id - next.id}).forEach(answer => {
                            dataArray = [...dataArray, (dataArray[dataArray.length-1] || 0) + (answer.correct_percentage===100 ? 1 : answer.correct_percentage/100 -1)];
                            let nextLabel = `${answer.answer}-${answer.correct_answer}`;
                        labelArray.push(nextLabel);
                        });
                        if (dataArray.length===0) {
                            dataArray = "No Data";
                        };
                        setUserData(dataArray);
                        setUserLabels(labelArray);
                    })
                    .catch((err) => {
                        if (!error.filter(e => e.msg === err.response.data.msg).length) {
                            setError([...error, err.response.data]);
                        };
                    });
                })
                .catch((err) => {
                    if (!error.filter(e => e.msg === err.response.data.msg).length) {
                        setError([...error, err.response.data]);
                    };
                });
            };
        };        
    }, [history, wordlist, error, wordlistId, type, folder]);
 
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
        scales: {
            x: {
                ticks: {
                    callback: function (value, index, ticks) {
                        const labelValue = this.getLabelForValue(value);
                        return labelValue.length>15 ? `${labelValue.slice(0,12)}...` : labelValue;
                    },
                },
            },
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

    if (!viewList.words&&!folder) {
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

    let statsColumn;
    if (!userData.length) {
        statsColumn = <div>Loading...</div>;
    } else if (userData==="No Data") {
        statsColumn = <p>No data to display!</p>;
    } else {
        statsColumn = (<div>
            <Line
            data={data}
            options={options}
            height={250}
            width={300}
            />
        
        </div>);
    };
    let wordpairIndex = -1;
    const playButtons = ["learn", "flashcards", "dynamic", "study"];
    let id = viewList.id;
    let navName = wordlist;
    if (folder) {
        id = folder.id;
        navName = folder.name;
    };
    return (
        <div className="page-container">
            <Header />
            <h2 className="page-title">{wordlist}</h2>
            <div className="fade divider view" />
            <div className="view-container">
                <div className="play section column">
                    <h2 className="section-title"><Link className="container" to={`/play/${navName}${folder?`?${id}F`:""}`} replace onClick={() => {localStorage.setItem(`playWordlistId`, id)}} >Play</Link></h2>
                    {playButtons.map(button => {
                        return (
                            <button key={`${button}-link`} onClick={localStorage.setItem("playWordlistId", id)} className="play-button container slide-button">
                                <Link className="play-button-link" to={`/play/${button}/${navName}${folder?`?${id}F`:""}`}  >
                                    <div>{capitalize(button)}</div>
                                    <img src={images[`${button}.png`].default} alt={button} />
                                </Link>
                            </button>
                        );
                    })}
                </div>
                <div className="edit section column">
                <h2 className="edit section-title"><Link className="container" to={`/edit/${navName}${folder?`?${id}F`:""}`} replace onClick={() => {localStorage.setItem(`editWordlistId`, id)}} >Edit</Link></h2>
                    {folder? <>
                        <div className="folder wordlist-card-container container">
                            {(expand? folder.wordlists:folder.wordlists.slice(0,5)).map(list => {
                                return (<WordlistCard key={list.id} id={list.id} list={list} />);
                            })}
                        </div>
                        {folder.wordlists.length>5 ? (<button className="slide-button expand" onClick={() => setExpand(!expand)}>{!expand ? "v" : "^"}</button>) : ""}
                    </>
                        : <>
                        
                        <div className="list-container view scale-down">
                            <LanguageSelect langs={viewList.langs} />
                            {viewList.words.map(wordpair => {
                                wordpairIndex++;
                                if (!expand && wordpairIndex>4) return "";
                                return(
                                <WordPair 
                                    key={`${wordpair.word}-${wordpair.translation}-wordpair`} 
                                    wordpair={wordpair} 
                                    index={wordpairIndex} 
                                />);
                            })}
                        </div>
                    {viewList.words.length>5 ? (<button className="slide-button expand" onClick={() => setExpand(!expand)}>{!expand ? "v" : "^"}</button>) : ""}
                    </>}
                    
                </div>

                <div className="stats section column">
                    <h2 className="section-title"><Link className="container" to={`/stats/${navName}${folder?`?${id}F`:""}`} replace onClick={() => {localStorage.setItem(`statsWordlistId`, id)}} >Stats</Link></h2>
                    {statsColumn}
                </div>
            </div>
        </div>
    );
};

export default View;