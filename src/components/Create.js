import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import axios from "axios";

import Header from "./Header";
import WordPair from "./WordPair";
import ErrorFlash from "./ErrorFlash";
import LanguageSelect from "./LanguageSelect";

import Bin from "../images/Icons/bin.png"

const Create = (props) => {
    const type = props.match.path.split("/")[1];
    let editing = type==="edit" ? true : false;
    const [wordlist, setWordlist] = useState(JSON.parse(localStorage.getItem(`${type}Wordlist`)) || {words: [], title: "New Wordlist", langs: "english-english", userId: "", toDelete: [], type});
    const [textArea, setTextArea] = useState(false);
    const [error, setError] = useState([]);
    let errorCount = 0;

    const textRef = React.createRef();
    const titleRef = React.createRef();
    const wordRef = React.createRef();
    const translationRef = React.createRef();

    let history = useHistory();

    useEffect(() => {
        if (!wordlist) return;
        else if (type==="create" && wordlist.type!==type) {
            setWordlist({words: [], title: "New Wordlist", langs: "english-english", userId: "", toDelete: [], type});
            document.getElementById("title-form").reset();
            if (wordlist.words && wordlist.type===type) {
                localStorage.setItem(`${type}Wordlist`, JSON.stringify(wordlist));
            };
        };
    }, [wordlist, type]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            const {id} = e.target;
            if (e.key==="Enter") {
                if (id.split("-")[0]==="add") {
                    document.getElementById("add-word").focus();
                } else if (id.split("-")[0]==="wordpairForm") {
                    e.preventDefault();
                    if (id.split("-")[1]==="word") {
                        document.getElementById(`wordpairForm-translation-${id.split("-")[2]}`).focus();
                    } else {
                        const el = document.getElementById(`wordpairForm-word-${parseInt(id.split("-")[2])+1}`);
                        if (el) el.focus();
                        else document.getElementById("add-word").focus();
                    };
                };
            };
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (editing) {
            localStorage.removeItem(`${type}Wordlist`);
            axios.get(`${process.env.REACT_APP_API_ADDRESS}/edit`, {
                params: {
                    id: localStorage.getItem("editWordlistId"),
                },
            })
            .then(res => {
                let { words, title, langs, userId } = res.data.wordlist;
                words = words.sort((a,b) => {return a.id - b.id});
                setWordlist({words, title, langs, userId, toDelete: [], type});
            })
            .catch((err) => {
                if (!err.response) console.log(err)
                else if (!error.filter(e => e.msg === err.response.data.msg).length) {
                    setError([...error, err.response.data]);
                };
            });
            return () => {
                localStorage.removeItem(`${type}Wordlist`);
            };
        };
    }, [editing, type, error]);

    const addWord = (e) => {
        e.preventDefault();
        const oldWordlist = {...wordlist};
        oldWordlist.words = [...wordlist.words, {word: wordRef.current.value, translation: translationRef.current.value}];
        oldWordlist.type = type;
        setWordlist(oldWordlist);
        e.target.reset();
    };
    const publishWordlist = () => {
        if (editing) {
            axios.put(`${process.env.REACT_APP_API_ADDRESS}/edit`, {
                id: localStorage.getItem("editWordlistId"),
                wordlist: wordlist.words,
                title: wordlist.title,
                langs: wordlist.langs,
                userId: wordlist.userId,
                toDelete: wordlist.toDelete,
            })
            .then(() => {
                localStorage.removeItem("editWordlistId");
                history.push("/dashboard");
            })
            .catch((err) => {
                if (!err.response) console.log(err)
                else if (!error.filter(e => e.msg === err.response.data.msg).length) {
                    setError([...error, err.response.data]);
                };
            });
            setWordlist("");
        } else {
            axios.post(`${process.env.REACT_APP_API_ADDRESS}/create`, {wordlist})
            .then(() => {
                localStorage.removeItem(`${type}Wordlist`);
                history.push("/dashboard");
            })
            .catch((err) => {
                if (!err.response) console.log(err)
                else if (!error.filter(e => e.msg === err.response.data.msg).length) {
                    setError([...error, err.response.data]);
                };
            });
            setWordlist("");
        };
    };   

    const updateWordpair = (index, value, type) => {
        const oldWordlist = {...wordlist};
        if (!value) value = type;
        oldWordlist.words[index][type] = value;
        setWordlist(oldWordlist);
    };
    const updateTitle = (lang1, lang2) => {
        const oldWordlist = {...wordlist};
        oldWordlist.title = titleRef.current.value;
        oldWordlist.langs = `${lang1 ? `${lang1}-${lang2}` : wordlist.langs}`;
        oldWordlist.type = type;
        setWordlist(oldWordlist);
    };

    const deleteWordpair = (wordpair) => {
        const newWords = wordlist.words.filter(word => {
            return word.word !== wordpair.word || word.translation !== wordpair.translation;
        });
        if (editing) {
            setWordlist({words: [...newWords], title: wordlist.title, langs: wordlist.langs, userId: wordlist.userId, toDelete: [...wordlist.toDelete, wordpair.id || ""], type});
        } else {
            setWordlist({ words: [...newWords], title: wordlist.title, langs: wordlist.langs, userId: wordlist.userId, toDelete: wordlist.toDelete }, type);
        }
    };
    const removeWordlist = () => {
        if (editing) {
            axios.delete(`${process.env.REACT_APP_API_ADDRESS}/edit`, {
                params: {
                    wordlistId: localStorage.getItem("editWordlistId"),
                    userId: wordlist.userId,
                },
            })
            .then(() => {
                localStorage.removeItem("editWordlistId");
                history.push("/dashboard");
            })
            .catch((err) => {
                if (!err.response) console.log(err)
                else if (!error.filter(e => e.msg === err.response.data.msg).length) {
                    setError([...error, err.response.data]);
                };
            });
            setWordlist("");
        } else {
            localStorage.removeItem(`${type}Wordlist`);
            document.getElementById("title-form").reset();
            setWordlist({words: [], title: "New Wordlist", langs: "english-english", type});
        };
    };

    const generateWordlistFromText = (e) => {
        e.preventDefault();
        const textList = textRef.current.value.split("\n").map(pair => {
            const [word, translation] = pair.split("=");
            if (word && translation) {
                return {word: word.trim(), translation: translation.trim()};
            } else return undefined;
        }).filter(item => {return item})
        setTextArea(false);
        setWordlist({words: textList, title: titleRef.current.value, langs: wordlist.langs, userId: wordlist.userId, toDelete: wordlist.toDelete, type})
    };
 
    let wordpairIndex = -1;
    let textareaActive = "";
    textArea ? textareaActive = "textareaActive" : textareaActive = "";
    const editWordlist = JSON.parse(localStorage.getItem("editWordlist"));
    if (!wordlist || (editing && (!wordlist.words.length || (editWordlist && !editWordlist.words)))) {
        return (
            <div className="page-container">
            {error.map(err => {
                errorCount++;
                return (
                <ErrorFlash key={`error-${errorCount}`} errorList={error} errorNum={errorCount} setError={setError} error={err} />
                );
            })}
            <Header />
            <h2 className="create-page-title">{!editing ? "Create" : "Edit"}</h2>
            <p>Loading...</p>
            </div>
        );
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
            <h2 className="create-page-title">{!editing ? "Create" : "Edit"}</h2>
            <div className="create-page-header">
                <button className={`slide-button process-button ${textareaActive}`} onClick={removeWordlist}><img src={Bin} alt="bin" /></button>
                <form id="title-form" autoComplete="off" spellCheck="false" className="word-list-title">
                    <input type="text" ref={titleRef} name="title" required placeholder="Title" onInput={() => updateTitle()} defaultValue={wordlist.title || "Title"} />
                </form>
                <button className={`slide-button process-button ${textareaActive}`} onClick={publishWordlist}>{editing ? "Update" : "Publish"} →</button>
            </div>
            <LanguageSelect updateTitle={updateTitle} langs={wordlist.langs} />
            {textArea ? (<>
                <textarea spellCheck="false" className="create-textarea" ref={textRef} rows="20" cols="60" placeholder="Insert Words in format:
                    Word=Translation
                    Word=Translation
                    Word=Translation
                    Word=Translation" />
                <div className="textarea-button-container">
                    <button className="gen-from-textarea-button slide-button " onClick={generateWordlistFromText}>Generate Wordlist →</button>
                    <button className="slide-button" onClick={() => setTextArea(!textArea)}>{textArea ? "Back to cards →" : "Create from text →"}</button>
                </div>
                </>) : ( 
                <div className="list-container">
                    {wordlist.words.map(wordpair => {
                        wordpairIndex++;
                        return(
                        <WordPair 
                            key={`${wordpair.word}-${wordpair.translation}-wordpair`} 
                            wordpair={wordpair} 
                            deleteWordpair={deleteWordpair} 
                            updateWordpair={updateWordpair} 
                            index={wordpairIndex} 
                        />);
                    })}
                    <form autoComplete="off" spellCheck="false" className="word-pair-container" onSubmit={addWord}>
                        <input id="add-word" type="text" ref={wordRef} name="word" required placeholder="Word" />
                        <button className="add-word-button" type="submit">+</button>
                        <input id="add-translation" type="text" ref={translationRef} name="translation" required placeholder="Translation" />
                    </form> 
                    <button className="textarea-switch slide-button" onClick={() => setTextArea(!textArea)}>{textArea ? "Back to cards →" : "Create from text →"}</button>
                </div>
            )}
        </div>
    );
};

export default Create;