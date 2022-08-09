import React from "react";
import { BrowserRouter as Router, Route, Switch} from "react-router-dom";
import './App.css';

import MainMenu from "./components/MainMenu";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Create from "./components/Create";
import Edit from "./components/Edit";
import Play from "./components/Play";

const App = () => {
  return (
    <Router>
      <div className="app-container">
          <Switch>
            <Route exact path="/home" component={MainMenu} />
            <Route exact path="/signup" component={Signup} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/dashboard" component={Dashboard} />
            <Route exact path="/create" component={Create} />
            <Route exact path="/edit" component={Edit} />
            <Route exact path="/play" component={Play} />
            <Route component={MainMenu} />
          </Switch>
      </div> 
  </Router>
  );
};

export default App;
