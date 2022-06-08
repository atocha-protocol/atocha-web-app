import React, { useEffect, useState } from 'react';
import sha256 from 'sha256';
import {
  Form,
  Input,
  Grid,
  Card,
  Statistic,
  TextArea,
  Label,
  Table,
  TableRow,
  TableCell,
  TableHeader, TableBody
} from 'semantic-ui-react';
import axios from 'axios';
import {BrowserRouter, Link, Route, Routes} from "react-router-dom";
import config from '../config';

import {useSubstrate, useSubstrateState} from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
import MakeAnswerSha256WithSimple from '../units/MakeAnswerSha256';
import { web3FromSource } from '@polkadot/extension-dapp';
import {useAtoContext} from "./AtoContext";
import {hexToBigInt, hexToString} from "@polkadot/util";

function Main (props) {
  const { api, currentAccount } = useSubstrateState();

  useEffect(() => {
  });

  return (
    <div>
      <h1>Featured puzzles</h1>
      <div className="ui grid">
        <div className="three column row">
          <div className="column">
            <div><img style={{width:"90%"}} src={atoFeatured[0]["imageUrl"]} /></div>
            <h3 style={{marginTop:"6px"}}><Link to={`/puzzle_detail/${atoFeatured[0]["hash"]}`}>{atoFeatured[0]["title"]}</Link></h3>
          </div>
          <div className="column">
            <div><img style={{width:"90%"}} src={atoFeatured[1]["imageUrl"]} /></div>
            <h3 style={{marginTop:"6px"}}><Link to={`/puzzle_detail/${atoFeatured[1]["hash"]}`}>{atoFeatured[1]["title"]}</Link></h3>
          </div>
          <div className="column">
            <div><img style={{width:"90%"}} src={atoFeatured[2]["imageUrl"]} /></div>
            <h3 style={{marginTop:"6px"}}><Link to={`/puzzle_detail/${atoFeatured[2]["hash"]}`}>{atoFeatured[2]["title"]}</Link></h3>
          </div>
        </div>       
      </div>
    </div>
  );
}

export default function AtochaHome (props) {
  const { api } = useSubstrateState();
  return api && api.query
    ? <Main {...props} />
    : null;
}