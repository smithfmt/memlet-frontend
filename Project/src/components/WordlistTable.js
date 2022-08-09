import React, { useState } from "react";

import WordPair from "./WordPair";

const WordlistTable = (props) => {

    const wordRef = React.createRef();
    const translationRef = React.createRef();
    const language1Ref = React.createRef();
    const language2Ref = React.createRef();
    const titleRef = React.createRef();

    const [addingWord, addAddingWord] = useState(false);
    const { wordlist } = props;

    const handleAddWord = (e) => {
        e.preventDefault();
        props.addWord({word: wordRef.current.value, translation: translationRef.current.value});
        addAddingWord(false);
    };

    const handleTitleUpdate = (e) => {
        props.updateTitle(titleRef.current.value, `${language1Ref.current.value}-${language2Ref.current.value}`);
    };

    const [lang1, lang2] = wordlist.langs.split("-")

    if (addingWord) {
        return (
            <div className="list-container">
                <div className="word-list-title">
                    <input type="text" ref={titleRef} name="title" required placeholder="Title" onInput={handleTitleUpdate} defaultValue={wordlist.title || "Title"} />
                </div>
                <div className="word-pair">
                    <select ref={language1Ref} className="lang-select" id="language1" name="language1" onChange={handleTitleUpdate} defaultValue={lang1} >
                        <option value="english">English</option>
                        <option value="french">French</option>
                        <option value="spanish">Spanish</option>
                        <option value="italian">Italian</option>
                    </select>
                    <div className="link-wrapper"><div className="link"></div></div>
                    <select ref={language2Ref} className="lang-select" id="language2" name="language2" defaultValue={lang2} onChange={handleTitleUpdate} >
                        <option value="english">English</option>
                        <option value="french">French</option>
                        <option value="spanish">Spanish</option>
                        <option value="italian">Italian</option>
                    </select>
                </div>
                <div className="divider-wrapper"><div className="divider"></div></div>
                {wordlist.wordlist.map(wordpair => {
                    return(<WordPair key={`${wordpair.word}-${wordpair.translation}-wordpair`} wordpair={wordpair} deleteWordpair={props.deleteWordpair} />);
                })}
                <form className="add-word-form" onSubmit={handleAddWord}>
                    <input type="text" ref={wordRef} name="word" required placeholder="Word" />
                    <div className="link-wrapper"><div className="link"></div></div>
                    <input type="text" ref={translationRef} name="translation" required placeholder="Translation" />
                    <button type="submit">Add +</button>
                </form> 
            </div> 
        );
    };
    return (
        <div className="list-container">
            <div className="word-list-title">
                <input type="text" ref={titleRef} name="title" required placeholder="Title" onInput={handleTitleUpdate} defaultValue={wordlist.title || "Title"} />
            </div>
            <div className="word-pair">
                <select ref={language1Ref} className="lang-select" id="language1" name="language1" onInput={handleTitleUpdate} defaultValue={lang1} >
                    <option value="english">English</option>
                    <option value="french">French</option>
                    <option value="spanish">Spanish</option>
                    <option value="italian">Italian</option>
                </select>
                <div className="link-wrapper"><div className="link"></div></div>
                <select ref={language2Ref} className="lang-select" id="language2" name="language2" defaultValue={lang2} onChange={handleTitleUpdate} >
                    <option value="english">English</option>
                    <option value="french">French</option>
                    <option value="spanish">Spanish</option>
                    <option value="italian">Italian</option>
                </select>
            </div>
            <div className="divider-wrapper"><div className="divider"></div></div>
            {wordlist.wordlist.map(wordpair => {
                return(<WordPair key={`${wordpair.word}-${wordpair.translation}-wordpair`} wordpair={wordpair} deleteWordpair={props.deleteWordpair} />);
            })}
            <button onClick={() => addAddingWord(true)}>+</button>
        </div>
    );
};

export default WordlistTable;