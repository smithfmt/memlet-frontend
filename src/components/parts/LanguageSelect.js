import React from "react";
import { capitalize } from "../../helpers";

const langList = ["english", "french", "spanish", "italian", "latin"];

const LanguageSelect = (props) => {
    const {langs, updateTitle} = props;
    const [lang1, lang2] = langs.split("-");
    return (
        <div className="word-pair">
            <div className="lang-select" >
                <div className="lang-select-selected">{capitalize(lang1)}</div>
                <div className="lang-select-dropdown">
                {langList.map(l => {
                    let top = "";
                    if (l===langList[0]) top = "top";
                    if (l===langList[langList.length-1]) top = "bottom-button";
                    return (<button className={`${top} ${lang1===l ? "selected" : ""}`} key={`lang1-option-${l}`} onClick={() => updateTitle(l, lang2)}>{capitalize(l)}</button>)
                })}
                </div>
            </div>
            <div className="link-wrapper"><div className="link" /></div>
            <div className="lang-select" >
                <div className="lang-select-selected">{capitalize(lang2)}</div>
                <div className="lang-select-dropdown">
                {langList.map(l => {
                    let top = "";
                    if (l===langList[0]) top = "top";
                    if (l===langList[langList.length-1]) top = "bottom-button";
                    return (<button className={`${top} ${lang2===l ? "selected" : ""}`} key={`lang1-option-${l}`} onClick={() => updateTitle(lang1, l)}>{capitalize(l)}</button>)
                })}
                </div>
            </div>
        </div>
    );
};

export default LanguageSelect;