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

  var atoIfRemoteJsLoaded=false;
  if(typeof(atoFeatured)=="undefined" || typeof(atoIframe)=="undefined"){
    
  }
  else{
    atoIfRemoteJsLoaded=true;
  }

  useEffect(() => {
  });

  return (
    <div>
      <h1>Featured puzzles</h1>
      {atoIfRemoteJsLoaded?
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
        <div className="three column row">
          <div className="column">
            <div><img style={{width:"90%"}} src={atoFeatured[3]["imageUrl"]} /></div>
            <h3 style={{marginTop:"6px"}}><Link to={`/puzzle_detail/${atoFeatured[3]["hash"]}`}>{atoFeatured[3]["title"]}</Link></h3>
          </div>
          <div className="column">
            <div><img style={{width:"90%"}} src={atoFeatured[4]["imageUrl"]} /></div>
            <h3 style={{marginTop:"6px"}}><Link to={`/puzzle_detail/${atoFeatured[4]["hash"]}`}>{atoFeatured[4]["title"]}</Link></h3>
          </div>
          <div className="column">
            <div><img style={{width:"90%"}} src={atoFeatured[5]["imageUrl"]} /></div>
            <h3 style={{marginTop:"6px"}}><Link to={`/puzzle_detail/${atoFeatured[5]["hash"]}`}>{atoFeatured[5]["title"]}</Link></h3>
          </div>
        </div>       
      </div>
      :
      "Loading..."
      }
      <br/>
      
      <div class="ui message">
        <div class="header">
          To play Atocha App, you need to...
        </div>
        <ul class="list">
          <li><a href="https://polkadot.js.org/extension/">Download Polkadot JS wallet browser extension</a></li>
          <li><a href="https://atochaprotocol.gitbook.io/atocha-protocol-wiki/puzzle-game-webapp-user-guide/bridge-ato-from-near-wallet-to-polkadot-js-wallet">Bridge ATO From Near Wallet to Polkadot JS Wallet</a></li>
        </ul>
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
