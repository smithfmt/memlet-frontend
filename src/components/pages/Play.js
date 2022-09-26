import React from "react";
import Header from "../parts/Header";
import { Link } from 'react-router-dom';

import Learn from "../../images/Play/learn.png";
import Dynamic from "../../images/Play/dynamic.png";
import Flashcards from "../../images/Play/flashcards.png";

const Play = (props) => {
    const wordlist = props.match.params.wordlist || "";
    return (
        <div className="page-container">
            <Header />
            <h2 className="page-title">{wordlist ? wordlist : "Play"}</h2>
            <div className="fade divider view" />
            <div className="view-container">
                <div className="play-page section">
                <Link className="column" to={`/play/flashcards${wordlist ? `/${wordlist}` : ""}`} replace >
                    <h2 className="section-title">Flashcards</h2>
                    <div>
                        Simple flashcards for speedy learning
                    </div>
                    <div className="img-container">
                        <img alt="flashcards-icon" src={Flashcards} />
                    </div>
                </Link>
                </div>

                <div className="play-page section">
                <Link className="column" to={`/play/learn${wordlist ? `/${wordlist}` : ""}`} replace >
                    <h2 className="section-title">Learn</h2>
                    <div>
                        {`A vanilla learning tool that tests your knowledge of your wordlist${wordlist ? "" : "s"}`}
                    </div>
                    <div className="img-container">
                        <img alt="learn" src={Learn} />
                    </div>
                </Link>
                </div>

                <div className="play-page section">
                <Link className="column" to={`/play/dynamic${wordlist ? `/${wordlist}` : ""}`} replace >
                    <h2 className="section-title">Dynamic Learn</h2>
                    <div>
                        An advanced learning tool that tests you based on your past results
                    </div>
                    <div className="img-container">
                        <img alt="dynamic" src={Dynamic} />
                    </div>
                </Link>
                </div>
            </div>
        </div>
    );
};

export default Play;