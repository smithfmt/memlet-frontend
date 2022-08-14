import React, { useState } from "react";

const WordPair = (props) => {
    const { wordpair } = props;
    const [deleting, setDeleting] = useState("");
    if (props.view) {
        return (
            <>
            <div className="word-pair">
                <div className="word" key={wordpair.word}>{wordpair.word}</div>
                <div className="link-wrapper"><div className="link"></div></div>
                <div className="word" key={wordpair.translation}>{wordpair.translation}</div>               
            </div>
            <div className="divider-wrapper"><div className="divider"></div></div>
            </>
        );
    };

    if (deleting==="deleting") {
        setTimeout(() => {
            console.log("deleted")
            props.deleteWordpair(wordpair);
        }, 100);
    }

    const wordRef = React.createRef();
    const translationRef = React.createRef();

    return (
        <>
        <form spellCheck="false" className={`word-pair-container ${deleting}`}>
            <input id={`wordpairForm-word-${props.index}`} ref={wordRef} type="text" placeholder="Word" defaultValue={wordpair.word} onBlur={() => props.updateWordpair(props.index, wordRef.current.value, "word")} />
            <button style={{"fontSize": "1.1rem"}} className="add-word-button wordpair" onClick={(e) => {e.preventDefault(); setDeleting("deleting")}}><div className="del">x</div><div className="index">{props.index+1}</div></button>
            <input id={`wordpairForm-translation-${props.index}`} ref={translationRef} type="text" placeholder="Translation" defaultValue={wordpair.translation} onBlur={() => props.updateWordpair(props.index, translationRef.current.value, "translation")} />
        </form>
        <div className="link-wrapper"><div className="link" /></div>
        </>
    );
};

export default WordPair;