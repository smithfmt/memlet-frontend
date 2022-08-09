import React from "react";
import { BrowserRouter as Router, Route, Switch} from "react-router-dom";
import './App.css';

import NotFound from "./components/NotFound";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Create from "./components/Create";
import Play from "./components/Play";
import View from "./components/View";
import Stats from "./components/Stats";
import Flashcards from "./components/Flashcards";
import Learn from "./components/Learn";
import Profile from "./components/Profile";
import Explore from "./components/Explore";
import Folder from "./components/Folder";

const App = () => {
  return (
    <Router>
      <div className="app-container">
          <Switch>
            <Route exact path="/signup" component={Signup} />
            <Route exact path="/login" component={Signup} />
            <Route exact path="/dashboard" component={Dashboard} />
            <Route exact path="/profile" component={Profile} />
            <Route exact path="/create" component={Create} />
            <Route exact path="/play" component={Play} />
            <Route exact path="/folder" component={Folder} />
            <Route path="/explore" component={Explore} />
            <Route path="/play/flashcards" component={Flashcards} />
            <Route path="/play/learn" component={Learn} />
            <Route path="/play/dynamic" component={Learn} />
            <Route exact path="/edit/:wordlist" component={Create} />
            <Route exact path="/play/:wordlist" component={Play} />
            <Route exact path="/view/:wordlist" component={View} />
            <Route path="/stats" component={Stats} />
            <Route component={NotFound} />
          </Switch>
      </div> 
    </Router>
  );
};

export default App;
