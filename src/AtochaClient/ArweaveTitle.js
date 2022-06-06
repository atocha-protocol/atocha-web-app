import React, { useEffect, useState } from 'react';
import sha256 from 'sha256';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Button, Table} from 'semantic-ui-react';
import config from '../config';
import axios from "axios";
import {BrowserRouter, Link, Route, Routes} from "react-router-dom";
import getShortText from "../units/GetShortText";

function Main (props) {
  const { puzzle_hash } = props;

  // Request url: http://148.72.247.143:1984/FvpwVOX3o7gkWD0Nu1G7LOhYDBpqoAuP06BaWbfgXj4
  let request = `${config.ARWEAVE_EXPLORE}/${puzzle_hash}`;
  let [puzzleInfo, setPuzzleInfo] = useState(null);

  // load json data.
  function loadJsonData() {
    axios.get(request, {}).then(function (response) {
      console.log(response.data);
      setPuzzleInfo(response.data);
    }).catch(function (error) {
      console.log(error);
    });
  }

  // Puzzle information.
  useEffect(async () => {
    if(puzzleInfo===null) {
      loadJsonData();
    }
  }, [setPuzzleInfo]);

  return (
      <Link to={`/puzzle_detail/${puzzle_hash}`}>{puzzleInfo?getShortText(puzzleInfo.puzzle_title):getShortText(puzzle_hash)}</Link>
  );
}

export default function ArweaveTitle (props) {
  const { puzzle_hash } = props;
  return puzzle_hash
    ? <Main {...props} />
    : null;
}
