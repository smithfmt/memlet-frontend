import React, { useCallback, useEffect, useState } from "react";
import { CSSTransition } from "react-transition-group";

const Flashcard = (props) => {
    const { id, current, wordpair } = props;
    const [side, setSide] = useState("front");
    const flip = useCallback(() => {
        if (side === "front") {
            setSide("back");
        } else {
            setSide("front");
        };
    }, [side]);
    

    useEffect(() => {
        const keyDown = (e) => {
            if (id === current && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
                flip();
            };
        };
        window.addEventListener("keydown", keyDown)
        return (() => window.removeEventListener("keydown", keyDown))
    }, [current, id, flip]);

    let pos = "";
    if (id===current) {
        pos="current";
    } else if (id===current+1) {
        pos="next";
    } else if (id===current-1) {
        pos="prev";
    };

    return (
        <CSSTransition>
        <div id={id} className={`flashcard ${pos}`} onClick={flip}>
            <div className={`flashcard-inner flip-${side}`}>
                <div className={`flashcard-front ${side}`}>{wordpair.word}</div> 
                <div className={`flashcard-back ${side}`}>{wordpair.translation}</div>
            </div>
        </div>
        </CSSTransition>
        
    );
};

export default Flashcard;