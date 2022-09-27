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
import Bin from "../../images/Icons/bin.png"

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
    const [editing, setEditing] = useState(false);
    const [included, setIncluded] = useState([]);
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
                setUserLabels(labelArray)
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
                    setFolder(res.data.folder);
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
    
    const toggleEditMode = () => {
        setEditing(!editing);
        const include = folder.wordlists.map(list => list.id);
        setIncluded(include);
    };

    const updateFolder = () => {
        const idArray = folder.wordlists.map(list => list.id).filter(id => !included.includes(id));
        axios.put(`${process.env.REACT_APP_API_ADDRESS}/removeWordlistsFromFolder`, {idArray, length:included.length, folderId: wordlistId})
        .then(res => {
            history.push("/dashboard");
        })
        .catch((err) => {
            if (!error.filter(e => e.msg === err.response.data.msg).length) {
                setError([...error, err.response.data]);
            };
        });
    };
    const deleteFolder = () => {
        axios.delete(`${process.env.REACT_APP_API_ADDRESS}/deleteFolder`, {
            params: {wordlistId},
        })
        .then(res => {
            history.push("/dashboard");
        })
        .catch((err) => {
            if (!error.filter(e => e.msg === err.response.data.msg).length) {
                setError([...error, err.response.data]);
            };
        });
    };

    if (folder) {
        return (
            <div className="page-container">
                {error.map(err => {
                    errorCount++;
                    return (
                        <ErrorFlash key={`error-${errorCount}`} errorList={error} errorNum={errorCount} setError={setError} error={err} />
                    );
                })}
                <Header />
                <h2 className="page-title">{wordlist}</h2>
                <div className="view-folder-button-container">
                    <button onClick={toggleEditMode} className={`slide-button ${editing ? "editing" : ""}`}>{editing ? "Editing" : "Edit"}</button>
                    <button onClick={updateFolder} className={`slide-button ${editing ? "" : "hidden"}`}>{`Update \xa0 (${included.length} Items)`}</button>
                    <button className={`slide-button`} onClick={deleteFolder}><img src={Bin} alt="bin" /></button>
                </div>
                <div className="folder wordlist-card-container container">
                    {folder.wordlists.map(list => {
                        return (<WordlistCard key={list.id} id={list.id} list={list} editing={editing ? "editing" : ""} included={included} setIncluded={setIncluded} />);
                    })}
                </div>
            </div>
        );
    };

    if (!viewList.words) {
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
    const playButtons = ["learn", "flashcards", "dynamic"]
    return (
        <div className="page-container">
            <Header />
            <h2 className="page-title">{wordlist}</h2>
            <div className="fade divider view" />
            <div className="view-container">
                <div className="play section column">
                    <h2 className="section-title"><Link className="container" to={`/play/${wordlist}`} replace onClick={() => {localStorage.setItem(`playWordlistId`, viewList.id)}} >Play</Link></h2>
                    {playButtons.map( button => {
                        return (
                            <button key={`${button}-link`} onClick={localStorage.setItem("playWordlistId", viewList.id)} className="play-button container slide-button">
                                <Link className="play-button-link" to={`/play/${button}/${wordlist}`} >
                                    <div>{capitalize(button)}</div>
                                    <img src={images[`${button}.png`].default} alt={button} />
                                </Link>
                            </button>
                        );
                    })}
                </div>

                <div className="edit section column">
                    <h2 className="edit section-title"><Link className="container" to={`/edit/${wordlist}`} replace onClick={() => {localStorage.setItem(`editWordlistId`, viewList.id)}} >Edit</Link></h2>
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
                </div>

                <div className="stats section column">
                    <h2 className="section-title"><Link className="container" to={`/stats/${wordlist}`} replace onClick={() => {localStorage.setItem(`statsWordlistId`, viewList.id)}} >Stats</Link></h2>
                    {statsColumn}
                </div>
            </div>
        </div>
    );
};

export default View;