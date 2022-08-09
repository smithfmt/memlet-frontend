import React, { useEffect } from "react";
import { useHistory, Link } from 'react-router-dom';

function importAll(r) {
    let images = {};
    r.keys().forEach((item, index) => { images[item.replace('./', '')] = r(item); });
    return images;
};
const images = importAll(require.context('../images/Icons', false, /\.(png|jpe?g|svg)$/));

const Header = (props) => {
    let history = useHistory();
    useEffect(() => {
        if (props.redirect && history.path!==`/${props.redirect}`) {
            history.push(`/${props.redirect}`);
        };
    });
    const buttons = ["home", "login", "signup", "create", "play"];
    return (
        <div className="header-container">
            {buttons.map(button => {
                return (
                <button key={button} className="header-button">
                    <Link to={button} >
                        <img src={images[`${button}.png`].default} alt={button} />
                    </Link>
                </button>
            )})}
            <button className="profile-button"><Link to="dashboard" ><img src={images["profile.png"].default} alt="dashboard" /></Link></button>
        </div>
    );
};

export default Header;