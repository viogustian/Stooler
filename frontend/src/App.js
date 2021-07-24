import React, { useState, useCallback } from 'react';
import './App.css';
import BarChart from './user/components/PieChart';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';
<<<<<<< HEAD
import Main from './groups/pages/main';
import Group from './groups/pages/groups';
import GroupAuth from './groups/pages/auth.js';
=======
>>>>>>> 6e7c5ee4697ae70637d84a88f924731cb447fff8
import Users from './user/pages/Users';
import Auth from './user/pages/Auth';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import { AuthContext } from './shared/context/auth-context';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = useCallback(() => {
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  let routes;

  if (isLoggedIn) {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Main />
        </Route>
        <Route path="/group_auth" exact>
          <GroupAuth />
        </Route>
        <Route path="/view_group" exact>
          <Group />
        </Route>
        <Redirect to="/" />
        
        
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        
        <Route path="/auth">
          <Auth />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }

  return (
    <AuthContext.Provider
      value={{ isLoggedIn: isLoggedIn, login: login, logout: logout }}
    >
      <Router>
        <MainNavigation />
        <main>{routes}</main>
      </Router>
<<<<<<< HEAD
      
=======
      <div className="App">
        <BarChart/>
      </div>
>>>>>>> 6e7c5ee4697ae70637d84a88f924731cb447fff8
    </AuthContext.Provider>
  );
};

export default App;
