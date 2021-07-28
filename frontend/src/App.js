import React, { useState, useCallback } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';
import Main from './groups/pages/main';
<<<<<<< HEAD
import Group from './groups/pages/groups';
import GroupAuth from './groups/pages/auth';
=======
import Group from './groups/pages/mygroup';
import GroupAuth from './groups/pages/auth.js';
>>>>>>> 60f933eebe8e925b1e4f8c543aec31eb9866467e
import Auth from './user/pages/Auth';
import Profile from './user/pages/Profile';
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
        <Route path="/profile" exact>
          <Profile />
        </Route>
        <Redirect to="/" />
        
        
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
          This IS HOME, Authenticate please
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
    </AuthContext.Provider>
  );
};

export default App;
