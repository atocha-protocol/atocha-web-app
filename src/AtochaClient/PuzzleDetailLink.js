import React, { useEffect, useState } from 'react';
import {BrowserRouter, Link, Route, Routes} from "react-router-dom";
import {useSubstrate} from "../substrate-lib";
import getShortText from "../units/GetShortText";

function Main (props) {
  const { puzzle_hash } = props;

  // Puzzle information.
  useEffect( () => {

  }, []);

  return (
    <>
      <Link to={`/puzzle_detail/${puzzle_hash}`}>{puzzle_hash?getShortText(puzzle_hash):'*'}</Link>
    </>
  );
}

export default function PuzzleDetailLink (props) {
  const { puzzle_hash } = props;
  return puzzle_hash
    ? <Main {...props} />
    : null;
}
