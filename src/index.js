import React from 'react'
import ReactDOM from 'react-dom'

import App from './App'
import AppSmooth from "./AppSmooth";
import {Container} from "semantic-ui-react";
import { Routes, Route, Link, BrowserRouter} from "react-router-dom";
import AtochaHome from "./AtochaClient/AtochaHome";
import PuzzleList2 from "./AtochaClient/PuzzleList2";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
