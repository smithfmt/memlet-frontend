import React from "react";
import { BrowserRouter as Router, Route, Switch} from "react-router-dom";
import "./css/app.css";
import "./css/dashboard.css";
import "./css/hud.css";
import "./css/explore.css";
import "./css/play.css";
import "./css/view.css";
import "./css/create.css";

import NotFound from "./components/pages/NotFound";
import Signup from "./components/pages/Signup";
import Dashboard from "./components/pages/Dashboard";
import Create from "./components/pages/Create";
import Play from "./components/pages/Play";
import View from "./components/pages/View";
import Stats from "./components/pages/Stats";
import Flashcards from "./components/pages/Flashcards";
import Learn from "./components/pages/Learn";
import Profile from "./components/pages/Profile";
import Explore from "./components/pages/Explore";
import Folder from "./components/pages/Folder";

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
