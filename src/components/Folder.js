import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import Header from "./Header";
import ErrorFlash from "./ErrorFlash";
import { capitalize } from "../helpers";
import { useHistory } from "react-router-dom";

const Folder = (props) => {
    const [error, setError] = useState([]);
    const [folder, setFolder] = useState({})
    const [wordlists, setWordlists] = useState([])
    const [selected, setSelected] = useState([]);
    const [dashboardFilters, setDashboardFilters] = useState({sortBy: "Recent", filter: {lang:"all", number: 0}, langs: []});
    const [prevSortBy, setPrevSortBy] = useState("Recent");
    let errorCount = 0;
    let history = useHistory();

    const titleRef = React.createRef();
    const updateTitle = (lang1, lang2) => {
        const oldFolder = {...folder};
        oldFolder.name = titleRef.current.value;
        setFolder(oldFolder);
    };

    const updateDashboardFilters = (prop, value) => {
        const newFilters = {...dashboardFilters};
        newFilters[prop] = value;
        setDashboardFilters(newFilters);
    };

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_ADDRESS}/dashboard`)
        .then(res => {
            setWordlists(res.data.user.wordlists.filter(list => {return !list.folderId}));
        })
        .catch((err) => {
            if (!error.filter(e => e.msg === err.response.data.msg).length) {
                setError([...error, err.response.data]);
            };
        });
    }, [error]);

    useEffect(() => {
        if (prevSortBy === dashboardFilters.sortBy) return;
        setPrevSortBy(dashboardFilters.sortBy);
        let newLists = [];
        const oldLists = [...wordlists];
        switch (dashboardFilters.sortBy) {
            case "Recent":
                newLists = oldLists.sort((a,b) => {
                    return moment(b.created).valueOf()-moment(a.created).valueOf();
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
    }, [wordlists, dashboardFilters, prevSortBy]);

    let langs = [];
    wordlists.forEach(list => {
        list.langs.split("-").forEach(lang => {
            if (!langs.includes(lang)) {langs.push(lang)};
        });
    });

    const createFolder = () => {
        const folder = {
            name: titleRef.current.value,
            length: selected.length,
            wordlists: selected,
        };
        axios.post(`${process.env.REACT_APP_API_ADDRESS}/create-folder`, {folder})
        .then(res => {
            history.push("/dashboard");
        })
        .catch((err) => {
            if (!error.filter(e => e.msg === err.response.data.msg).length) {
                setError([...error, err.response.data]);
            };
        });
    };

    return (
        <div className="page-container">
            {error.map(err => {
                errorCount++;
                return (
                    <ErrorFlash key={`error-${errorCount}`} errorList={error} errorNum={errorCount} setError={setError} error={err} />
                );
            })}
            <Header />
            <h2 className="page-title">Create Folder</h2>
            <div className="folder-title-container">
                <form id="title-form" autoComplete="off" spellCheck="false" className="word-list-title folder">
                    <input type="text" ref={titleRef} name="title" required placeholder="Title" onInput={() => updateTitle()} defaultValue={folder.title || "Title"} />
                </form>
                <button onClick={() => createFolder()} className="slide-button">{`Create Folder → (${selected.length} items)`}</button>
            </div>
            
            <div className="dashboard explore-container-details">
                <h2>Add Wordlists</h2>
                <div className="sortBy-filters">
                    <div className="sortBy-label">{"Filter:"}</div>
                    <div className="sortBy-dropdown">
                        <div className="sortBy-dropdown-selected">{`${capitalize(dashboardFilters.filter.lang)} (${dashboardFilters.filter.lang==="all" ? wordlists.length : dashboardFilters.filter.number})`}</div>
                        <div className="sortBy-dropdown-menu">
                            {langs.map(lang => {
                                let top = "";
                                if (lang===langs[0]) top = "top";
                                let number = wordlists.filter(list => {
                                    return list.langs.split("-").includes(lang);
                                }).length;
                            return (
                                <button key={`${lang}-option`} className={`${dashboardFilters.filter.lang===lang? "selected" : ""} ${top}`} onClick={() => updateDashboardFilters("filter", {lang, number})}>{`${capitalize(lang)} (${number})`}</button>
                            )})}
                            <button className={`bottom-button ${dashboardFilters.filter.lang==="all"? "selected" : ""}`} onClick={() => updateDashboardFilters("filter", {lang: "all", number: wordlists.length})}>{`All (${wordlists.length})`}</button>
                        </div>
                    </div>
                    <div className="sortBy-label">{"Sort By:"}</div>
                    <div className="sortBy-dropdown">
                        <div className="sortBy-dropdown-selected">{dashboardFilters.sortBy}</div>
                        <div className="sortBy-dropdown-menu">
                            <button className={`${dashboardFilters.sortBy==="Recent"? "selected" : ""} top`} onClick={() => updateDashboardFilters("sortBy", "Recent")}>Recent</button>
                            <button className={`bottom-button ${dashboardFilters.sortBy==="Alphabetical"? "selected" : ""}`} onClick={() => updateDashboardFilters("sortBy", "Alphabetical")}>A-Z</button>
                        </div>
                    </div>
                </div> 
            </div>
            <div className="folder wordlist-card-container">
                {wordlists.map(list => {
                    if (!list.langs.split("-").includes(dashboardFilters.filter.lang) && dashboardFilters.filter.lang!=="all") return "";
                    return (
                        <button 
                        key={`${list.id}-listcard`}
                        onClick={() => {
                            if (!selected.includes(list.id)) {
                                setSelected([...selected, list.id])
                            } else {
                                setSelected([...selected.filter(id => id!==list.id)])
                            };
                        }} 
                        className={`wordlist-card ${selected.includes(list.id) ? "selected" : ""}`}
                        >
                            <h2 className="title">{list.title}</h2>
                            <div className="wordlist-card-details">
                                <p>{`${capitalize(list.langs.split("-")[0])} - ${capitalize(list.langs.split("-")[1])}`}</p>
                                <p className="count">{list.length} Items</p>
                            </div>
                            <div className="wordlist-card-highlight"></div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Folder;