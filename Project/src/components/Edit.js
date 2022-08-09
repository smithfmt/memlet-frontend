import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

import Header from "./Header";
import WordlistTable from "./WordlistTable";

const Edit = () => {  
    let history = useHistory();

    // On mount //
    useEffect(() => {
        localStorage.removeItem("editWordlist");
        axios.get("http://localhost:7000/userAPI/edit", {
            params: {
                id: localStorage.getItem("editWordlistId"),
            },
        })
        //.then(res => console.log(res.data.wordlist));
        .then(res => setWords({wordlist: JSON.parse(res.data.wordlist.wordlist), title: res.data.wordlist.title, langs: res.data.wordlist.langs, userId: res.data.wordlist.userId}));
    // On unmount //
        return () => {
            localStorage.removeItem("editWordlist");
        };
    }, []);
    
    const [words, setWords] = useState(JSON.parse(localStorage.getItem("editWordlist")) || "");

    // On words change //
    useEffect(() => {
        if (words.wordlist) {localStorage.setItem("editWordlist", JSON.stringify(words))};
    }, [words]);

    if (!words) {
        return (
            <div className="page-container">
                <Header />
            </div>
        );
    };

    const addWord = (word) => {
        setWords({wordlist: [...words.wordlist, word], title: words.title, langs: words.langs, userId: words.userId});
    };

    const deleteWordpair = (wordpair) => {
        const newWords = words.wordlist.filter(word => {
            return word.word !== wordpair.word || word.translation !== wordpair.translation;
        });
        setWords({wordlist: [...newWords], title: words.title, langs: words.langs, userId: words.userId});
    };

    const updateTitle = (title, langs) => {
        setWords({wordlist: words.wordlist, title, langs, userId: words.userId});
    };

    const removeWordlist = async () => {
        console.log(words.userId)
        await axios.delete(`http://localhost:7000/userAPI/edit`, {
            params: {
                wordlistId: localStorage.getItem("editWordlistId"),
                userId: words.userId,
            },
        });
        localStorage.removeItem("editWordlistId");
        history.push("/dashboard");
    };

    const updateWordlist = async () => {
        axios.put(`http://localhost:7000/userAPI/edit`, {
            id: localStorage.getItem("editWordlistId"),
            wordlist: JSON.stringify(words.wordlist),
            title: words.title,
            langs: words.langs,
            userId: words.userId,
        });
        localStorage.removeItem("editWordlistId");
        history.push("/dashboard");
    };    

    return (
        <div className="page-container">
            <Header />
            <h2>Edit {words.title}</h2>
            <WordlistTable wordlist={words} deleteWordpair={deleteWordpair} updateTitle={updateTitle} addWord={addWord} />
            <div>
            <button onClick={updateWordlist}>Update Wordlist</button>
            <button onClick={removeWordlist} >Remove Wordlist</button>
            </div>
        </div>
    );
};

export default Edit;