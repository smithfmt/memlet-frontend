import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import axios from "axios";
import { setLocalStorage } from "../../auth";
import Header from "../parts/Header";
import ErrorFlash from "../parts/ErrorFlash";

const Signup = (props) => {
    const page = props.match.path;
    const usernameRef = React.createRef();
    const passwordRef = React.createRef();
    const confirmedPasswordRef = React.createRef();

    let history = useHistory();
    const [error, setError] = useState([]);

    const handleSignup = async (e) => {
        e.preventDefault();
        const user = {
            username: usernameRef.current.value,
            password: passwordRef.current.value,
            confirmedPassword: confirmedPasswordRef.current.value
        };

        await axios.post(`${process.env.REACT_APP_API_ADDRESS}/signup`, { ...user })
        .then((res) => {
            setLocalStorage(res);
            history.push("/dashboard");
        })
        .catch((err) => {
            if (!error.filter(e => e.msg === err.response.data.msg).length) {
                setError([...error, err.response.data]);
            };
        });
    };
    let errorCount = 0;
    if (page==="/signup") return (
        <div className="page-container">
            {error.map(err => {
                errorCount++;
                return (
                    <ErrorFlash key={`error-${errorCount}`} errorList={error} errorNum={errorCount} setError={setError} error={err} />
                );
            })}
            <Header />
            <h2 className="page-title">Signup</h2>
            <form autoComplete="off" spellCheck="false" className="signup profile-form column" onSubmit={handleSignup}> 
                <input type="text" ref={usernameRef} name="username" required placeholder="Username" />
                <input type="password" ref={passwordRef} name="password" required placeholder="Password" />
                <input type="password" ref={confirmedPasswordRef} name="password-confirm" required placeholder="Confirm Password" />
                <div className="container">
                    <button className="signup-page-button slide-button"><Link to="login">Login instead →</Link></button>
                    <button className="slide-button" type="submit">Submit →</button>
                </div>
            </form>
        </div>
    );
    const handleLogin = async (e) => {
        e.preventDefault();
        const user = {
            username: usernameRef.current.value,
            password: passwordRef.current.value,
        };
        await axios.post(`${process.env.REACT_APP_API_ADDRESS}/login`, { ...user })
        .then((res) => {
            setLocalStorage(res);
            history.push("/dashboard");
        })
        .catch((err) => {
            if (!error.filter(e => e.msg === err.response.data.msg).length) {
                setError([...error, err.response.data]);
            };
        });

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
            <h2 className="page-title">Login</h2>
            <form autoComplete="off" spellCheck="false" className="signup profile-form column" onSubmit={handleLogin}>
                <input type="text" ref={usernameRef} name="username" required placeholder="Username" />
                <input type="password" ref={passwordRef} name="password" required placeholder="Password" />
                <div className="container">
                    <button type="button" className="signup-page-button slide-button"><Link to="signup">Signup instead →</Link></button>
                    <button className="slide-button" type="submit">Submit →</button>
                </div>
            </form>
        </div>
    );
};
    
export default Signup;