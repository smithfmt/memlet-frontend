import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import axios from "axios";
import App from './App';
import reportWebVitals from './reportWebVitals';

axios.interceptors.request.use(
  req => {
    const token = localStorage.getItem("token");
    if (token) {
      req.headers.Authorization = token;
      return req;
    } else {
      return req;
    };
  },
);

axios.interceptors.response.use(
  res => {return res},
  err => {
    if (err.response && err.response.data === "Unauthorized") {
      throw {response: {data: { type: "Auth", success: false, msg: "Sorry! Please Login to see this!" }}};
    } else {
      throw err;
    };
  },
);


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
