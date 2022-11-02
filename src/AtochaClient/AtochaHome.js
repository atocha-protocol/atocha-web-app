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
  //alert("AtochaHome.js|main");
  const {api,currentAccount} = useSubstrateState();
  const {puzzleSets:{rebirthAccount}} = useAtoContext();

  var atoIfRemoteJsLoaded=false;
  if(typeof(atoFeatured)=="undefined" || typeof(atoIframe)=="undefined"){
    
  }
  else{
    atoIfRemoteJsLoaded=true;
  }

  useEffect(() => {
    rebirthAccount()
  });

  return (
    <div>
      <h1>Featured puzzles</h1>
      {atoIfRemoteJsLoaded?
      <div className="ui grid">
        <div className="three column row">
          <div className="column">
            <div>
              <Link to={`/puzzle_detail/${atoFeatured[0]["hash"]}`}>
                <img style={{width:"90%"}} src={atoFeatured[0]["imageUrl"]} />
              </Link>
            </div>
            <h3 style={{marginTop:"6px"}}><Link to={`/puzzle_detail/${atoFeatured[0]["hash"]}`}>{atoFeatured[0]["title"]}</Link></h3>
          </div>
          <div className="column">
            <div>
              <Link to={`/puzzle_detail/${atoFeatured[1]["hash"]}`}>
                <img style={{width:"90%"}} src={atoFeatured[1]["imageUrl"]} />
              </Link>
            </div>
            <h3 style={{marginTop:"6px"}}><Link to={`/puzzle_detail/${atoFeatured[1]["hash"]}`}>{atoFeatured[1]["title"]}</Link></h3>
          </div>
          <div className="column">
            <div>
              <Link to={`/puzzle_detail/${atoFeatured[2]["hash"]}`}>
                <img style={{width:"90%"}} src={atoFeatured[2]["imageUrl"]} />
              </Link>
            </div>
            <h3 style={{marginTop:"6px"}}><Link to={`/puzzle_detail/${atoFeatured[2]["hash"]}`}>{atoFeatured[2]["title"]}</Link></h3>
          </div>
        </div>       
        <div className="three column row">
          <div className="column">
            <div>
              <Link to={`/puzzle_detail/${atoFeatured[3]["hash"]}`}>
                <img style={{width:"90%"}} src={atoFeatured[3]["imageUrl"]} />
              </Link>
            </div>
            <h3 style={{marginTop:"6px"}}><Link to={`/puzzle_detail/${atoFeatured[3]["hash"]}`}>{atoFeatured[3]["title"]}</Link></h3>
          </div>
          <div className="column">
            <div>
              <Link to={`/puzzle_detail/${atoFeatured[4]["hash"]}`}>
                <img style={{width:"90%"}} src={atoFeatured[4]["imageUrl"]} />
              </Link>  
            </div>
            <h3 style={{marginTop:"6px"}}><Link to={`/puzzle_detail/${atoFeatured[4]["hash"]}`}>{atoFeatured[4]["title"]}</Link></h3>
          </div>
          <div className="column">
            <div>
              <Link to={`/puzzle_detail/${atoFeatured[5]["hash"]}`}>
                <img style={{width:"90%"}} src={atoFeatured[5]["imageUrl"]} />
              </Link>  
            </div>
            <h3 style={{marginTop:"6px"}}><Link to={`/puzzle_detail/${atoFeatured[5]["hash"]}`}>{atoFeatured[5]["title"]}</Link></h3>
          </div>
        </div>
        <div className="three column row">
          <div className="column">
            <div>
              <Link to={`/puzzle_detail/${atoFeatured[6]["hash"]}`}>
                <img style={{width:"90%"}} src={atoFeatured[6]["imageUrl"]} />
              </Link>
            </div>
            <h3 style={{marginTop:"6px"}}><Link to={`/puzzle_detail/${atoFeatured[6]["hash"]}`}>{atoFeatured[6]["title"]}</Link></h3>
          </div>
          <div className="column">
            <div>
              <Link to={`/puzzle_detail/${atoFeatured[7]["hash"]}`}>
                <img style={{width:"90%"}} src={atoFeatured[7]["imageUrl"]} />
              </Link>  
            </div>
            <h3 style={{marginTop:"6px"}}><Link to={`/puzzle_detail/${atoFeatured[7]["hash"]}`}>{atoFeatured[7]["title"]}</Link></h3>
          </div>
          <div className="column">
            <div>
              <Link to={`/puzzle_detail/${atoFeatured[8]["hash"]}`}>
                <img style={{width:"90%"}} src={atoFeatured[8]["imageUrl"]} />
              </Link>  
            </div>
            <h3 style={{marginTop:"6px"}}><Link to={`/puzzle_detail/${atoFeatured[8]["hash"]}`}>{atoFeatured[8]["title"]}</Link></h3>
          </div>
        </div>     
        <div className="three column row">
          <div className="column">
            <div>
              <Link to={`/puzzle_detail/${atoFeatured[9]["hash"]}`}>
                <img style={{width:"90%"}} src={atoFeatured[9]["imageUrl"]} />
              </Link>
            </div>
            <h3 style={{marginTop:"6px"}}><Link to={`/puzzle_detail/${atoFeatured[9]["hash"]}`}>{atoFeatured[9]["title"]}</Link></h3>
          </div>
          <div className="column">
            <div>
              <Link to={`/puzzle_detail/${atoFeatured[10]["hash"]}`}>
                <img style={{width:"90%"}} src={atoFeatured[10]["imageUrl"]} />
              </Link>  
            </div>
            <h3 style={{marginTop:"6px"}}><Link to={`/puzzle_detail/${atoFeatured[10]["hash"]}`}>{atoFeatured[10]["title"]}</Link></h3>
          </div>
          <div className="column">
            <div>
              <Link to={`/puzzle_detail/${atoFeatured[11]["hash"]}`}>
                <img style={{width:"90%"}} src={atoFeatured[11]["imageUrl"]} />
              </Link>  
            </div>
            <h3 style={{marginTop:"6px"}}><Link to={`/puzzle_detail/${atoFeatured[11]["hash"]}`}>{atoFeatured[11]["title"]}</Link></h3>
          </div>
        </div>                   
      </div>
      :
      "Loading..."
      }
      <br/><br/>
      
      <div className="ui message">
        <div className="header">
          To run Atocha Puzzles, you need to...
        </div>
        <ul className="list">
          <li>Download <a href="https://polkadot.js.org/extension/">PolkadotJS wallet browser extension</a> and add it to your browser. </li>
          <li>Open the extension and add a new account.</li>
          <li>Go to <a href="https://mainnet.oct.network/bridge/near/atocha">Octopus network bridge</a> and bridge ATO from your near account to the new created account on PolkadotJS wallet. <a href="https://atochaprotocol.gitbook.io/atocha-protocol-wiki/puzzle-game-webapp-user-guide/bridge-ato-from-near-wallet-to-polkadot-js-wallet">How to do this?</a></li>
          <li>Back to play.atocha.io, it is done! You can create, solve, sponsor and challenge puzzles using your ATO now.</li>
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
