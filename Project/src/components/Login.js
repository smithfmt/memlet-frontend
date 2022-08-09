import React from "react";
import Header from "./Header";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { setLocalStorage } from "../auth";

const Login = () => {

    const usernameRef = React.createRef();
    const passwordRef = React.createRef();

    let history = useHistory();

    const handleLogin = async (e) => {
        e.preventDefault();
        const user = {
            username: usernameRef.current.value,
            password: passwordRef.current.value,
        };

        await axios.post(`http://192.168.11.49:7000/userAPI/login`, { ...user })
        .then((res) => {setLocalStorage(res)});

        history.push("/dashboard");
    };

    return (
        <div className="page-container">
            <Header />
            <h2>Login</h2>
            <form className="login-form" onSubmit={handleLogin}>
                <input type="text" ref={usernameRef} name="name" required placeholder="Name" />
                <input type="password" ref={passwordRef} name="password" required placeholder="Password" />
                <button type="submit">Submit →</button>
            </form>
        </div>
    );
};

export default Login;