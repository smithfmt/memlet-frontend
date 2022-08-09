import React from "react";
import Header from "./Header";

const Play = () => {
    const games = ["learn", "flashcards"];
    return (
        <div className="page-container">
            <Header />
            <h2>Play</h2>
            <div className="games-container">
                {games.map((game) => {
                    return (
                    <button className="game-card">{game}</button>
                    );
                })}
            </div>
        </div>
    );
};

export default Play;