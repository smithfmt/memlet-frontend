import React, { useState, useEffect } from "react";
import axios from "axios";

import Header from "./Header";
import WordlistTable from "./WordlistTable";

const Create = () => {
    const [wordlist, setWordlist] = useState(JSON.parse(localStorage.getItem("createWordlist")) || {});
    const [creating, setCreating] = useState(localStorage.getItem("createWordlist") ? true : false);

    useEffect(() => {
        if (wordlist.wordlist) {localStorage.setItem("createWordlist", JSON.stringify(wordlist))};
    }, [wordlist]);

    const addWord = (word) => {
        setWordlist({wordlist: [...wordlist.wordlist, word], title: wordlist.title, langs: wordlist.langs});
    };

    const deleteWordpair = (wordpair) => {
        const newWords = wordlist.wordlist.filter(word => {
            return word.word !== wordpair.word || word.translation !== wordpair.translation;
        });
        setWordlist({ wordlist: [...newWords], title: wordlist.title, langs: wordlist.langs });
    };

    const updateTitle = (title, langs) => {
        setWordlist({wordlist: wordlist.wordlist, title, langs});
    };

    const createWordlist = () => {
        setCreating(true);
        setWordlist({wordlist: [], title: "New Wordlist", langs: "Lang1-Lang2"});
    };

    const removeWordlist = () => {
        localStorage.removeItem("createWordlist");
        setCreating(false);
        setWordlist({});
    };
    //http://192.168.11.49:7000/userAPI/
    const publishWordlist = () => {
        console.log(wordlist)
        axios.post(`http://localhost:7000/userAPI/create`, {wordlist})
        .then(() => removeWordlist())
        .catch(err => console.log(err));
    };    

    if (creating) {
        return (
            <div className="page-container">
                <Header />
                <h2>Create Wordlist</h2>
                <WordlistTable deleteWordpair={deleteWordpair} wordlist={wordlist} addWord={addWord} updateTitle={updateTitle} />
                <div className="create-wordlist-button-container">
                    <button onClick={publishWordlist}>Publish Wordlist →</button>
                    <button onClick={removeWordlist}>Remove Wordlist x</button>
                </div>
            </div>
        );
    };
    return (
        <div className="page-container">
            <Header />
            <h2>Create Wordlist</h2>
            <button className="" onClick={createWordlist}>New Wordlist</button>
        </div>
    );
};

export default Create;