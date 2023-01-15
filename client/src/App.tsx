import logo from './logo.svg';
import './App.css';

import React, { useRef, useState, useEffect } from 'react';
import * as signalR from "@microsoft/signalr";
import { BrowserRouter, defer, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { createTheme } from '@mui/material/styles';
import { AppBar, Avatar, Box, Container, IconButton, Menu, MenuItem, ThemeProvider, Toolbar, Tooltip, Typography } from '@mui/material';

import { Home } from './home/Home';
import CollabEditor from './tools/collab-edit/editor/CollabEditor';
import { AccountCircle } from '@mui/icons-material';
import { Login } from './auth/Login';
import { Room } from './room/Room';



export const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hubBuilder, setHubBuilder] = useState<signalR.HubConnectionBuilder>();



  const navigateToLogin = () => {
    navigate("/login", {
      state: {
        // eslint-disable-next-line no-restricted-globals
        from: location.pathname
      }
    });
  };

  useEffect(() => {
    if (location && location.pathname) {
      let needAuth: boolean = false;
      switch (location.pathname) {
        case "":
          needAuth = false;
          break;
        case "/code":
          needAuth = true;
          break;
        case "/room":
          needAuth = true;
          break;
        default:
          needAuth = false;
          break;
      }
      if (needAuth) {
        const auth = sessionStorage.getItem("auth");
        if (auth === null || auth === "" || !JSON.parse(auth) || !JSON.parse(auth).expiration || !JSON.parse(auth).token) {
          navigateToLogin();
        } else {
          const expirationDate = new Date(JSON.parse(auth).expiration);
          const today = new Date();
          if (expirationDate < today) {
            navigateToLogin();
          }
        }
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    setHubBuilder(new signalR.HubConnectionBuilder());
  }, []);

  return (
    <React.Fragment>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography
              onClick={() => {
                navigate("");
              }}
              variant="h6"
              noWrap
              component="div"
              sx={{ display: { xs: 'none', sm: 'block', flexGrow: 1 } }}
            >
              QUICK COLLAB TOOLS
            </Typography>
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Login">
                <IconButton onClick={navigateToLogin} sx={{ p: 0 }}>
                  <AccountCircle />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Routes>
        <Route index element={<Home hubBuilder={hubBuilder} />}></Route>
        <Route path='/room' element={<Room hubBuilder={hubBuilder} />}></Route>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/code/:roomId' element={<CollabEditor hubBuilder={hubBuilder} />}></Route>
      </Routes>
    </React.Fragment>
  );
}

export default App;
