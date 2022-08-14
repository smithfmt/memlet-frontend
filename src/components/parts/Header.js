import React, { useEffect, useState } from "react";
import { useHistory, Link } from 'react-router-dom';
import { capitalize } from "../../helpers";
import Logo from "../../images/Logo/Logo.png";
import Backdrop from "../../images/Backdrop/backdrop.png"
import axios from "axios";

function importAll(r) {
    let images = {};
    r.keys().forEach((item, index) => { images[item.replace('./', '')] = r(item); });
    return images;
};
const images = importAll(require.context('../../images/Icons', false, /\.(png|jpe?g|svg)$/));
const avatars = importAll(require.context("../../images/Avatars", false, /\.(png|jpe?g|svg)$/));

const Header = (props) => {
    let history = useHistory();
    const [user, setUser] = useState({});

    useEffect(() => {
        if (props.redirect && history.path!==`/${props.redirect}`) {
            history.push(`/${props.redirect}`);
        };
    });
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_ADDRESS}/dashboard`)
        .then(res => {
            setUser(res.data.user);
        })
        .catch((err) => {
            console.log(err);
        });
    }, [])
    const buttons = ["dashboard", "create", "play", "explore", "stats"];
    return (
        <>
        <div className="header-container">
            <div className="header-info-cover"></div>
            <div className="header-logo">
                <Link to="/dashboard" replace>
                <img src={Logo} alt="logo"></img>
                </Link>
            </div>
            {buttons.map(button => {
                return (
                    <Link className="header-button-container" to={`/${button}`} replace key={button}>
                    <button className={`header-button ${button}`}>
                        <img src={images[`${button}.png`].default} alt={button} />
                    </button>
                    <div className="header-button-info">
                        {capitalize(button)}
                    </div>
                    </Link>
            )})}
            <Link key="profile" className="profile-button-container" to="/profile" replace>
            <button className="profile-button">
                <img src={user.avatar && user.avatar!=="none" ? avatars[`${user.avatar}.png`].default : images["profile.png"].default} alt="profile" />
            </button>
            <div className="header-button-info">
                Profile
            </div>
            </Link>
        </div>
        <div className="backdrop-container">
            <img src={Backdrop} alt="backdrop"/>
        </div>
        </>
    );
};

export default Header;