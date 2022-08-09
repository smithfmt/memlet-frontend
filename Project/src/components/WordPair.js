import React from "react";

const WordPair = (props) => {
    const { wordpair } = props;
    return (
        <>
        <div className="word-pair">
            <div className="word" key={wordpair.word}>{wordpair.word}</div>
            <div className="link-wrapper"><div className="link"></div></div>
            <div className="word" key={wordpair.translation}>{wordpair.translation}</div>
            <div className="delete-word-container">
                <button className="delete-word" onClick={() => props.deleteWordpair(wordpair)}>x</button>
            </div>
            
        </div>
        <div className="divider-wrapper"><div className="divider"></div></div>
        </>
    );
};

export default WordPair;