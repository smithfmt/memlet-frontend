import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { Link } from "react-router-dom";
import { Line } from 'react-chartjs-2';
import ErrorFlash from "./ErrorFlash";
import Header from "./Header";
import WordlistCard from "./WordlistCard";
import { capitalize } from "../helpers";

const Dashboard = () => {
    const [error, setError] = useState([]);
    const [loggedOut, setLoggedOut] = useState(false);
    const [user, setUser] = useState({wordlists: []});
    const [stats, setStats] = useState({wordlistItems: [], answers: []});
    const [prevSortBy, setPrevSortBy] = useState("");
    const [prevFolderSortBy, setPrevFolderSortBy] = useState("");
    const [dashboardFilters, setDashboardFilters] = useState({
        sortBy: "Recent", 
        viewAll: false, 
        filter: {lang:"all", number: 0}, 
        langs: [], 
        folderViewAll: false,
        folderSortBy: "Recent",
    });

    let errorCount = 0;

    useEffect(() => {
        if (!loggedOut) {
            axios.get(`${process.env.REACT_APP_API_ADDRESS}/dashboard`)
            .then(res => {
                setUser(res.data.user);
            })
            .catch((err) => {
                if (!err.response) return console.log(err)
                else if (err.response.data.type!=="Auth") {
                    setUser({wordlists: [], error:true});
                    if (err.response && !error.filter(e => e.msg === err.response.data.msg).length) {
                        setError([...error, err.response.data]);
                    };
                } else {
                    setLoggedOut(true);
                };
            });
            axios.get(`${process.env.REACT_APP_API_ADDRESS}/all-stats`)
            .then(res => {
                const {wordlistItems, answers} = res.data;
                setStats({wordlistItems, answers});
            })
            .catch((err) => {
                if (!err.response) return console.log(err)
                else if (err.response.data.type!=="Auth") {
                    setUser({wordlists: [], error:true});
                    if (err.response && !error.filter(e => e.msg === err.response.data.msg).length) {
                        setError([...error, err.response.data]);
                    };
                } else {
                    setLoggedOut(true);
                };
            });
        };
    }, [error, loggedOut]);

    useEffect(() => {
        if (!user.folders) {
            return;
        } else if (prevSortBy !== dashboardFilters.sortBy) {
            setPrevSortBy(dashboardFilters.sortBy);
            let newLists = [];
            const oldLists = [...user.wordlists];
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
            const oldUser = {...user};
            oldUser.wordlists = newLists;
            setUser(oldUser);
        } else if (prevFolderSortBy !== dashboardFilters.folderSortBy) {
            setPrevFolderSortBy(dashboardFilters.folderSortBy);
            let newFolders = [];
            const oldFolders = [...user.folders];
            switch (dashboardFilters.folderSortBy) {
                case "Recent":
                    newFolders = oldFolders.sort((a,b) => {
                        return b.id-a.id;
                    });
                    break;
                case "Alphabetical":
                    newFolders = oldFolders.sort((a,b) => {
                        if(a.name < b.name) return -1;
                        if(a.name > b.name) return 1;
                        return 0;
                    });
                    break;
                default:
                    break;
            };
            const oldUser = {...user};
            oldUser.folders = newFolders;
            setUser(oldUser);
        };
    }, [prevSortBy, prevFolderSortBy, user, dashboardFilters]);

    const userLabels = stats.answers.map(ans => {
        return `${ans.answer} - ${ans.correct_answer}`;
    });
    let userData = [];
    const roundToTwo = (num) => {
        return +(Math.round(num + "e+2")  + "e-2");
    };
    stats.answers.reduce((acc, cur) => {
        const perc = Math.floor(cur.correct_percentage);
        const newVal = roundToTwo(acc + (perc===100 ? 1 : -1 + (perc/100)));
        userData.push(newVal);
        return newVal;
    },0);

    const options = {
        title:{
            display:true,
            text:`User Stats`,
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

    let langs = [];
    user.wordlists.forEach(list => {
        list.langs.split("-").forEach(lang => {
            if (!langs.includes(lang)) {langs.push(lang)};
        });
    });

    const updateDashboardFilters = (prop, value) => {
        const newFilters = {...dashboardFilters};
        newFilters[prop] = value;
        setDashboardFilters(newFilters);
    };

    let listNumber = 0;
    let folderNumber = 0;
    if (user.name) {
        return (
        <div className="page-container">
            {error.map(err => {
                errorCount++;
                return (
                    <ErrorFlash key={`error-${errorCount}`} errorList={error} errorNum={errorCount} setError={setError} error={err} />
                );
            })}
            <Header />
            <h2 className="dashboard-title">Welcome to your Dashboard {user.name!=="NA" ? user.name : user.username}!</h2>
            <div className="dashboard-container">
                <div className="dashboard explore-container-details">
                    <h2>Wordlists</h2>
                    <div className={`sortBy-filters ${!user.wordlists.length ? "hidden" : ""}`}>
                        <div className="sortBy-label">{"Filter:"}</div>
                        <div className="sortBy-dropdown">
                            <div className="sortBy-dropdown-selected">{`${capitalize(dashboardFilters.filter.lang)} (${dashboardFilters.filter.lang==="all" ? user.wordlists.length : dashboardFilters.filter.number})`}</div>
                            <div className="sortBy-dropdown-menu">
                                {langs.map(lang => {
                                    let top = "";
                                    if (lang===langs[0]) top = "top";
                                    let number = user.wordlists.filter(list => {
                                        return list.langs.split("-").includes(lang);
                                    }).length;
                                return (
                                    <button key={`${lang}-option`} className={`${dashboardFilters.filter.lang===lang? "selected" : ""} ${top}`} onClick={() => updateDashboardFilters("filter", {lang, number})}>{`${capitalize(lang)} (${number})`}</button>
                                )})}
                                <button className={`bottom-button ${dashboardFilters.filter.lang==="all"? "selected" : ""}`} onClick={() => updateDashboardFilters("filter", {lang: "all", number: user.wordlists.length})}>{`All (${user.wordlists.length})`}</button>
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
                        <div className="show-all">
                            <div>Show All:</div>
                            <button className={`show-all-button ${dashboardFilters.viewAll ? "showing" : ""}`} onClick={() => updateDashboardFilters("viewAll", !dashboardFilters.viewAll)}/>
                        </div>
                    </div> 
                </div>
                <div className="wordlist-card-container">
                    {user.wordlists.map(list => {
                        if (!list.langs.split("-").includes(dashboardFilters.filter.lang) && dashboardFilters.filter.lang!=="all") return "";
                        if ((listNumber<7 || dashboardFilters.viewAll) && listNumber<100) {
                            listNumber++;
                            return (<WordlistCard key={list.id} id={list.id} list={list} />)
                        } else return "";
                    })}
                    <WordlistCard create={true}/>
                </div>
                <div className="dashboard explore-container-details">
                    <h2>Folders</h2>
                    <div className={`sortBy-filters ${!user.folders.length ? "hidden" : ""}`}>
                        <div className="sortBy-label">{"Sort By:"}</div>
                        <div className="sortBy-dropdown">
                            <div className="sortBy-dropdown-selected">{dashboardFilters.folderSortBy}</div>
                            <div className="sortBy-dropdown-menu">
                                <button className={`${dashboardFilters.folderSortBy==="Recent"? "selected" : ""} top`} onClick={() => updateDashboardFilters("folderSortBy", "Recent")}>Recent</button>
                                <button className={`bottom-button ${dashboardFilters.folderSortBy==="Alphabetical"? "selected" : ""}`} onClick={() => updateDashboardFilters("folderSortBy", "Alphabetical")}>A-Z</button>
                            </div>
                        </div>
                        <div className="show-all">
                            <div>Show All:</div>
                            <button className={`show-all-button ${dashboardFilters.folderViewAll ? "showing" : ""}`} onClick={() => updateDashboardFilters("folderViewAll", !dashboardFilters.folderViewAll)}/>
                        </div>
                    </div> 
                </div>
                <div className="wordlist-card-container">
                    {user.folders.map(folder => {
                        if ((folderNumber<7 || dashboardFilters.folderViewAll) && folderNumber<100) {
                            folderNumber++;
                            return (<WordlistCard key={folder.id} id={folder.id} list={folder} folder={true} />)
                        } else return "";
                    })}
                    <Link to="folder">
                    <button className="wordlist-card create-card-container">
                        <div className="wordlist-create">Create folder +</div>
                        <div className="wordlist-card-highlight"></div>
                    </button>
                    </Link>
                </div>
                <h2 className="dashboard-section-title">Stats</h2>
                <div className="container dashboard-stats">
                    {(!stats.answers.length ? (
                        <div className="no-data">No data to display!</div>
                    ) : (
                        <Line
                        data={data}
                        options={options}
                        height={350}
                        width={800}
                        />
                        )
                    )}
                </div>
            </div>
            
        </div>
        );
    };
    if (loggedOut) {
        return (
            <div className="page-container">
                {error.map(err => {
                    errorCount++;
                    return (
                        <ErrorFlash key={`error-${errorCount}`} errorList={error} errorNum={errorCount} setError={setError} error={err} />
                    );
                })}
                <Header />
                <h2 className="page-title">Dashboard</h2>
                <p className="dashboard-login">You need to <Link to="login">Login</Link> or <Link to="signup">Signup</Link> to view your Dashboard</p>
            </div>
        );
    };
    return (
    <div className="page-container">
        <Header />
        <p style={{"marginTop": "4rem"}}>Loading...</p>
    </div>
    );
};

export default Dashboard;