import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import ErrorFlash from "./ErrorFlash";

function importAll(r) {
    let images = {};
    r.keys().forEach((item, index) => { images[item.replace('./', '')] = r(item); });
    return images;
};
const avatars = importAll(require.context("../images/Avatars", false, /\.(png|jpe?g|svg)$/));

const Profile = () => {
    const [error, setError] = useState([]);
    const [user, setUser] = useState(false);
    const [selected, setSelected] = useState("");

    let errorCount = 0;
    let history = useHistory();

    const usernameRef = React.createRef();
    const oldPasswordRef = React.createRef();
    const newPasswordRef = React.createRef();
    const confirmedNewPasswordRef = React.createRef();
    const nameRef = React.createRef();

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_ADDRESS}/dashboard`)
        .then(res => {
            setUser(res.data.user);
            setSelected(res.data.user.avatar);
        })
        .catch((err) => {
            if (!error.filter(e => e.msg === err.response.data.msg).length) {
                setError([...error, err.response.data]);
            };
            if (err.response.data.type==="Auth") {
                setTimeout(() => {
                    history.push("login");
                }, 500);
            };
        }); 
    }, [error, history]);
    const handleUpdate = async (e) => {
        e.preventDefault();
        const newUser = {
            name: nameRef.current.value ? nameRef.current.value : "NA",
            username: usernameRef.current.value ? usernameRef.current.value : user.username,
            oldPassword: oldPasswordRef.current.value,
            newPassword: newPasswordRef.current.value ? newPasswordRef.current.value : oldPasswordRef.current.value,
            confirmedNewPassword: confirmedNewPasswordRef.current.value ? confirmedNewPasswordRef.current.value : oldPasswordRef.current.value,
            avatar: selected,
        };
        axios.put(`${process.env.REACT_APP_API_ADDRESS}/profile`, newUser)
        .then(res => {
            history.push("/dashboard");
        })
        .catch((err) => {
            if (!error.filter(e => e.msg === err.response.data.msg).length) {
                setError([...error, err.response.data]);
            };
        });
        setUser("");
    };

    const logout = () => {
        localStorage.removeItem("expires");
        localStorage.removeItem("token");
    };

    if (!user) {
        return (
            <div className="page-container">
            {error.map(err => {
                errorCount++;
                return (
                    <ErrorFlash key={`error-${errorCount}`} errorList={error} errorNum={errorCount} setError={setError} error={err} />
                );
            })}
            <Header />
            <p>Loading...</p>
        </div> 
        );
    };
    return (
        <div className="page-container">
            {error.map(err => {
                errorCount++;
                return (
                    <ErrorFlash key={`error-${errorCount}`} errorList={error} errorNum={errorCount} setError={setError} error={err} />
                );
            })}
            <Header />
            <h2 className="page-title">{user.name!=="NA" ? user.name : user.username}'s Profile</h2>
            <div className="profile-page-container container">
                <div className="avatar-selection">
                    <h2 className="page-title">Select Your Avatar</h2>
                    {Object.keys(avatars).map(avatar => {
                        return (
                            <button key={avatar} onClick={() => setSelected(avatar.split(".")[0])} className={`avatar-select ${avatar.split(".")[0]===selected ? "selected" : ""}`}>
                                <img className="avatar" src={avatars[avatar].default} alt={avatar} />
                            </button>
                        )
                    })}
                    <button onClick={() => setSelected("none")} className={`avatar-select ${selected==="none" ? "selected" : ""}`}>
                        <div className="avatar">x</div>
                    </button>
                </div>
                <form autoComplete="off" className="profile-form" onSubmit={handleUpdate}> 
                    <label>Name</label>
                    <input type="text" ref={nameRef} name="name" placeholder="Choose a nickname" defaultValue={user.name!=="NA" ? user.name : ""}/>
                    <div className="divider profile fade" />
                    <label>Username</label>
                    <input type="text" ref={usernameRef} name="username" placeholder="Username" defaultValue={user.username} />
                    <div className="divider profile fade" />
                    <label>Old Password</label>
                    <input type="password" ref={oldPasswordRef} name="old-password" required placeholder="Old Password" />
                    <div className="divider profile fade" />
                    <label>New Password</label>
                    <input type="password" ref={newPasswordRef} name="new-password" placeholder="New Password" />
                    <div className="divider profile fade" />
                    <label>Confirm New Password</label>
                    <input type="password" ref={confirmedNewPasswordRef} name="new-password-confirm" placeholder="Confirm New Password" />
                    <div className="container">
                        <button className="slide-button profile-button" type="submit">Update Profile →</button>
                        <button className="slide-button profile-button" ><Link className="profile-button-link" to="/dashboard" onClick={() => logout()} >Logout →</Link></button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;