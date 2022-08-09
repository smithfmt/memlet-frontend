import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Header from "./Header";
import WordlistCard from "./WordlistCard";

const Dashboard = (props) => {
    const [message, setMessage] = useState({msg: "", err: "", user: ""});
    
    useEffect(() => {
        axios.get(`http://localhost:7000/userAPI/dashboard`)
        .then(res => {
            setMessage({msg: res.data.msg, user: res.data.user});
        })
        .catch(err => setMessage({err}));
    }, []);
    
    if (message.msg) {
        console.log(message)
        return (
        <div className="page-container">
            <Header />
            <h2>Dashboard</h2>
            <p>{message.msg} <strong>{message.user.username}</strong>!</p>
            <div className="wordlist-card-container">
                {message.user.wordlists.map(list => {
                    const { title } = list;
                    return (<WordlistCard key={list.id} changeWordlist={props.changeWordlist} title={title || "Wordlist"} id={list.id} />
                )})}
            </div>
        </div>
        );
    };
    if (message.err) {
        return (
            <div className="page-container">
                <Header />
                <h2>Dashboard</h2>
                <p>You need to <Link to="login">Login</Link> or <Link to="signup">Signup</Link> to view your Dashboard</p>
            </div>
        );
    };
    return (
    <div className="page-container">
        <Header />
    </div>
    );
};

export default Dashboard;