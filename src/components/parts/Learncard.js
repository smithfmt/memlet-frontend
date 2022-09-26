import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { compare, capitalize } from "../../helpers";

const Learncard = (props) => {
    const answerRef = React.createRef();
    const { id, current, wordpair, selectedLang, changeCard, error, setError } = props;

    const [answered, setAnswered] = useState(false);
    const [corrPercent, setCorrPercent] = useState(100);

    const nextCard = useCallback(() => {
        let corr = false;
        if (corrPercent===100) {
            corr = true;
        };
        setAnswered(false);
        changeCard(corr);
    }, [changeCard, corrPercent]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key==="Enter" && answered) {
                nextCard()
            } else return;
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [answered, nextCard]);
    
    let position = "";
    if (id===current) {
        position = "current";
    } else if (id===current+1) {
        position = "next";
    } else if (id===current-1) {
        position = "prev";
    };

    let display = wordpair.word;
    let correctAnswer = wordpair.translation;
    if (selectedLang==="lang2") {
        display = wordpair.translation;
        correctAnswer = wordpair.word;
    };

    let answerDisplay = <p></p>;

    const handleAnswer = (e) => {
        e.preventDefault();
        const clientResult = compare(answerRef.current.value, correctAnswer);
        console.log("client",clientResult)
        const charArray = clientResult[0];
        setCorrPercent(clientResult[1]);
        let key = 0;
        answerDisplay = charArray.map((obj) => {
            key++;
            return (
                <p className={`${obj.correct} answer-char`} key={`${obj.char}${key}`}>{obj.char}</p>
            );
        });
        setAnswered(answerDisplay);
        axios.post(`${process.env.REACT_APP_API_ADDRESS}/answer`, {
            answer: answerRef.current.value, 
            correct: correctAnswer,
            wordlistItemId: wordpair.id,
        })
        .then(res => {
            const { result } = res.data;
            console.log("server",result)
            if (result[1] !== clientResult[1]) {
                const charArray = result[0];
                setCorrPercent(result[1]);
                let key = 0;
                answerDisplay = charArray.map((obj) => {
                    key++;
                    return (
                        <p className={obj.correct} key={`${obj.char}${key}`}>{obj.char}</p>
                    );
                });
                setAnswered(answerDisplay);
            };
        })
        .catch(err => {
            if (!error.filter(e => e.msg === err.response.data.msg).length) {
                setError([...error, err.response.data]);
            };
        });
    };

    if (answered) {
        let answerMessage = "correct";
        if (corrPercent<100) {answerMessage = "almost"};
        if (corrPercent<65) {answerMessage = "incorrect"};
        return (
            <div className={`learncard-container ${position}`}>
                <div id={id} className={`learncard answer`} >
                    <div className="answercard-container">
                        <h2 className={`${answerMessage} answercard-message`}>{`${capitalize(answerMessage)}!`}</h2>
                        <div className="answer-container">
                            <p>{correctAnswer}</p><p className="correct-answer-divider">-</p>{answered}  
                        </div>
                        <button className="slide-button" onClick={nextCard}>→</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`learncard-container ${position}`}>
            <div id={id} className={`learncard`} >
                <form className="answer-form" onSubmit={handleAnswer}>
                {display} = 
                <input autoComplete="off" spellCheck="false" id={`learncard-input-${id}`} type="text" name="answer" required ref={answerRef} placeholder="Translation" autoFocus="autofocus" />
                <button className="slide-button" type="submit">→</button>
                </form>
            </div>
        </div>
        
    );
};

export default Learncard;