import React from "react";
import Header from "./Header";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { setLocalStorage } from "../auth";

const Signup = () => {
    
    const usernameRef = React.createRef();
    const passwordRef = React.createRef();
    const confirmedPasswordRef = React.createRef();

    let history = useHistory();

    const handleSignup = async (e) => {
        e.preventDefault();
        const user = {
            username: usernameRef.current.value,
            password: passwordRef.current.value,
            confirmedPassword: confirmedPasswordRef.current.value
        };

        await axios.post(`http://192.168.11.49:7000/userAPI/signup`, { ...user })
        .then((res) => {setLocalStorage(res)});

        history.push("/dashboard");
    };
   
    return (
        <div className="page-container">
            <Header />
            <h2>Signup</h2>
            <form className="signup-form" onSubmit={handleSignup}> 
                <input type="text" ref={usernameRef} name="name" required placeholder="Name" />
                <input type="password" ref={passwordRef} name="password" required placeholder="Password" />
                <input type="password" ref={confirmedPasswordRef} name="password-confirm" required placeholder="Confirm Password" />
                <button type="submit">Submit →</button>
            </form>
        </div>
    );
};
    
export default Signup;