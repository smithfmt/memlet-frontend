import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import Header from "../parts/Header";
import ErrorFlash from "../parts/ErrorFlash";
import { Link } from "react-router-dom";
import { capitalize } from "../../helpers";
import WordPair from "../parts/WordPair";
import LanguageSelect from "../parts/LanguageSelect";

import upvote from "../../images/Icons/upvote.png";
import upvoted from "../../images/Icons/upvoted.png";

function importAll(r) {
    let images = {};
    r.keys().forEach((item, index) => { images[item.replace('./', '')] = r(item); });
    return images;
};
const avatars = importAll(require.context("../../images/Avatars", false, /\.(png|jpe?g|svg)$/));

const Explore = (props) => {
    const wordlist = props.location.pathname.split("/")[2];
    const [error, setError] = useState([]);
    const [wordlists, setWordlists] = useState([]);
    const [exploreList, setExploreList] = useState({});
    const [currentUser, setCurrentUser] = useState(false);
    const [exploreFilters, setExploreFilters] = useState({sortBy: "Top Rated", viewAll: false, filter: {lang:"all", number: 0}, langs: []});
    const [prevSortBy, setPrevSortBy] = useState("Top Rated");
    let errorCount = 0;

    useEffect(() => {
        return () => {
            localStorage.removeItem("exploreListId");
        };
    },[]);        

    const updateExploreFilters = (prop, value) => {
        const newFilters = {...exploreFilters};
        newFilters[prop] = value;
        setExploreFilters(newFilters);
    };

    useEffect(() => {
        if (wordlist) {
            setWordlists([]);
            axios.get(`${process.env.REACT_APP_API_ADDRESS}/explore-list`, {
                params: {
                    id: parseInt(localStorage.getItem("exploreListId")),
                },
            })
            .then(res => {
                setExploreList(res.data.wordlist);
                setCurrentUser(res.data.user);
            })
            .catch((err) => {
                if (!error.filter(e => e.msg === err.response.data.msg).length) {
                    setError([...error, err.response.data]);
                };
            });
        } else {
            setExploreList({});
            axios.get(`${process.env.REACT_APP_API_ADDRESS}/explore`)
            .then(res => {
                setWordlists(res.data.wordlists);
            })
            .catch((err) => {
                if (!error.filter(e => e.msg === err.response.data.msg).length) {
                    setError([...error, err.response.data]);
                };
            });
        };
    }, [error, wordlist]);

    useEffect(() => {
        if (prevSortBy === exploreFilters.sortBy) return;
        setPrevSortBy(exploreFilters.sortBy);
        let newLists = [];
        const oldLists = [...wordlists];
        switch (exploreFilters.sortBy) {
            case "Top Rated":
                newLists = oldLists.sort((a, b) => {
                    return b.upvoted.length-a.upvoted.length;
                });
                break;
            case "Recent":
                newLists = oldLists.sort((a,b) => {
                    return moment(b.created).valueOf()-moment(a.created).valueOf();
                });
                break;
            case "Copied":
                newLists = oldLists.sort((a,b) => {
                    return b.copied-a.copied;
                });
                break;
            case "Alphabetical":
                newLists = oldLists.sort((a,b) => {
                    if(a.title < b.title) return -1;
                    if(a.title > b.title) return 1;
                    return 0;
                });
                break;
            default:
                break;
        };
        setWordlists(newLists);
    }, [wordlists, exploreFilters, prevSortBy]);

    if (exploreList.words) {
        let wordpairIndex = -1;
        return (
            <div className="page-container">
                {error.map(err => {
                    errorCount++;
                    return (
                        <ErrorFlash key={`error-${errorCount}`} errorList={error} errorNum={errorCount} setError={setError} error={err} />
                    );
                })}
                <Header />
                <div className="exploreList-buttons">
                <button className="copy-button slide-button process-button">
                    <Link to="/create" onClick={() => {
                        const createList = {...exploreList};
                        createList.title = `${createList.title} (Copy)`;
                        createList.type = "create";
                        localStorage.setItem("createWordlist", JSON.stringify(createList));
                        axios.put(`${process.env.REACT_APP_API_ADDRESS}/copy`, exploreList)
                        .catch((err) => {
                            if (!error.filter(e => e.msg === err.response.data.msg).length) {
                                setError([...error, err.response.data]);
                            };
                        })}} >
                    Copy
                    </Link>
                </button>
                    <h2>{exploreList.title}</h2>
                    <button className="upvote-button slide-button process-button" onClick={() => {
                        const newExploreList = {...exploreList};
                        if (newExploreList.upvoted.includes(currentUser)) {
                            newExploreList.upvoted = newExploreList.upvoted.filter(id => id!==currentUser);
                        } else {
                            newExploreList.upvoted = [...newExploreList.upvoted, currentUser];
                        };
                        axios.put(`${process.env.REACT_APP_API_ADDRESS}/upvote`, exploreList)
                        .then(res => {
                            if (res.data.response.upvoted!==exploreList.upvoted) {
                                setExploreList({...res.data.response, words: exploreList.words});
                            };
                        })
                        .catch((err) => {
                            if (!error.filter(e => e.msg === err.response.data.msg).length) {
                                setError([...error, err.response.data]);
                            };
                        });
                        setExploreList(newExploreList);
                        }}><img className="upvote-image" alt="upvote-button" src={exploreList.upvoted.includes(currentUser) ? upvoted : upvote}></img>
                    </button>
                </div>
                <div className="list-container view explore">
                    <LanguageSelect langs={exploreList.langs} />
                    {exploreList.words.map(wordpair => {
                        wordpairIndex++;
                        return(
                        <WordPair 
                            key={`${wordpair.word}-${wordpair.translation}-wordpair`} 
                            wordpair={wordpair} 
                            index={wordpairIndex} 
                        />);
                    })}
                </div>
            </div>
        );              
    } else if (!wordlists.length) {
        return(
            <div className="page-container">
                {error.map(err => {
                    errorCount++;
                    return (
                        <ErrorFlash key={`error-${errorCount}`} errorList={error} errorNum={errorCount} setError={setError} error={err} />
                    );
                })}
                <Header />
                <h2 className="page-title">Explore</h2>
                <p style={{"marginTop": "2rem"}}>Loading...</p>
            </div>
        );        
    };
    let listNumber = 0;
    let langs = [];
    wordlists.forEach(list => {
        list.langs.split("-").forEach(lang => {
            if (!langs.includes(lang)) {langs.push(lang)};
        });
    });

    return (
        <div className="page-container">
            {error.map(err => {
                errorCount++;
                return (
                    <ErrorFlash key={`error-${errorCount}`} errorList={error} errorNum={errorCount} setError={setError} error={err} />
                );
            })}
            <Header />
            <h2 className="page-title">Explore</h2>
            <div className="explore-container-details">
                <h2>{exploreFilters.sortBy}</h2>
                <div className="sortBy-filters">
                    <div className="sortBy-label">{"Filter:"}</div>
                    <div className="sortBy-dropdown">
                        <div className="sortBy-dropdown-selected">{`${capitalize(exploreFilters.filter.lang)} (${exploreFilters.filter.lang==="all" ? wordlists.length : exploreFilters.filter.number})`}</div>
                        <div className="sortBy-dropdown-menu">
                            {langs.map(lang => {
                                let top = "";
                                if (lang===langs[0]) top = "top";
                                let number = wordlists.filter(list => {
                                    return list.langs.split("-").includes(lang);
                                }).length;
                            return (
                                <button key={`${lang}-option`} className={`${exploreFilters.filter.lang===lang? "selected" : ""} ${top}`} onClick={() => updateExploreFilters("filter", {lang, number})}>{`${capitalize(lang)} (${number})`}</button>
                            )})}
                            <button className={`bottom-button ${exploreFilters.filter.lang==="all"? "selected" : ""}`} onClick={() => updateExploreFilters("filter", {lang: "all", number: wordlists.length})}>{`All (${wordlists.length})`}</button>
                        </div>
                    </div>
                    <div className="sortBy-label">{"Sort By:"}</div>
                    <div className="sortBy-dropdown">
                        <div className="sortBy-dropdown-selected">{exploreFilters.sortBy}</div>
                        <div className="sortBy-dropdown-menu">
                            <button className={`${exploreFilters.sortBy==="Recent"? "selected" : ""} top`} onClick={() => updateExploreFilters("sortBy", "Recent")}>Recent</button>
                            <button className={`${exploreFilters.sortBy==="Alphabetical"? "selected" : ""}`} onClick={() => updateExploreFilters("sortBy", "Alphabetical")}>A-Z</button>
                            <button className={`${exploreFilters.sortBy==="Copied"? "selected" : ""}`} onClick={() => updateExploreFilters("sortBy", "Copied")}>Copied</button>
                            <button className={`bottom-button ${exploreFilters.sortBy==="Top Rated"? "selected" : ""}`} onClick={() => updateExploreFilters("sortBy", "Top Rated")}>Top Rated</button>
                        </div>
                    </div>
                    <div className="show-all">
                        <div>Show All:</div>
                        <button className={`show-all-button ${exploreFilters.viewAll ? "showing" : ""}`} onClick={() => updateExploreFilters("viewAll", !exploreFilters.viewAll)}/>
                    </div>
                </div> 
            </div>
            <div className="explore-container">
                {wordlists.map(list => {
                    if (!list.langs.split("-").includes(exploreFilters.filter.lang) && exploreFilters.filter.lang!=="all") return "";
                    if ((listNumber<9 || exploreFilters.viewAll) && listNumber<100) {
                        listNumber++;
                        return (
                            <Link to={`/explore/${list.reference}`} onClick={() => localStorage.setItem("exploreListId", list.id)} key={`exploreList-${list.id}`}>
                                <button className="explore-card">
                                    <div className="container explore-card-title">
                                        <h2>{list.title}</h2>
                                        {avatars[`${list.user.avatar}.png`] ? <div className="avatar-container"><img alt={list.user.avatar} src={avatars[`${list.user.avatar}.png`].default}/></div> : ""}
                                    </div>
                                    <div>{`${capitalize(list.langs.split("-")[0])} - ${capitalize(list.langs.split("-")[1])}`}</div>
                                    <div>{`Created by ${list.user.username}`}</div>
                                    <div>{list.upvoted.length}👍</div>
                                    <div>Copied {list.copied} times</div>
                                    <div className="wordlist-card-highlight"></div>
                                </button>
                            </Link>
                        )
                    } else return "";
                    })}
            </div>
        </div>
    );
};

export default Explore;